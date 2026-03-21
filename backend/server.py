from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import time
from collections import defaultdict
import httpx
import base64
import cloudinary
import cloudinary.uploader

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
import certifi
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    retryWrites=True,
    tls=True,
    tlsCAFile=certifi.where(),
)
db = client[os.environ['DB_NAME']]
db_connected = False

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'dm-order-system-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Admin credentials from env or defaults
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@narucify.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Frontend URL for OG redirects
_raw_frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
# Ensure FRONTEND_URL always has https:// prefix
if _raw_frontend_url and not _raw_frontend_url.startswith('http'):
    FRONTEND_URL = f"https://{_raw_frontend_url}"
else:
    FRONTEND_URL = _raw_frontend_url

# Resend Email Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
_raw_from_email = os.environ.get('RESEND_FROM_EMAIL', 'Narucify <onboarding@resend.dev>')
# Fix from_email: extract just the email part and rebuild properly
import re as _re
_email_match = _re.search(r'[\w.+-]+@[\w.-]+\.\w+', _raw_from_email)
if _email_match:
    _extracted_email = _email_match.group(0)
    RESEND_FROM_EMAIL = f"Narucify <{_extracted_email}>"
else:
    RESEND_FROM_EMAIL = 'Narucify <onboarding@resend.dev>'

async def send_verification_email(to_email: str, verification_token: str):
    """Send email verification link via Resend API"""
    verify_url = f"{FRONTEND_URL}/verify-email/{verification_token}"
    
    logger.info(f"send_verification_email called: to={to_email}, RESEND_API_KEY={'SET('+RESEND_API_KEY[:8]+'...)' if RESEND_API_KEY else 'NOT SET'}, FRONTEND_URL={FRONTEND_URL}, from={RESEND_FROM_EMAIL}")
    
    if not RESEND_API_KEY:
        logger.warning(f"RESEND_API_KEY not set. Verification link: {verify_url}")
        return {"success": False, "error": "RESEND_API_KEY not configured"}
    
    html_body = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #FF5500, #FF7700); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 24px;">N</div>
            <h1 style="margin: 12px 0 0; font-size: 24px; color: #111;">Narucify</h1>
        </div>
        <div style="background: #f9f9f9; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="margin: 0 0 12px; color: #111; font-size: 20px;">Verifikuj svoju email adresu</h2>
            <p style="color: #666; margin: 0 0 24px; line-height: 1.5;">Klikni na dugme ispod da aktiviraš svoj Narucify nalog.</p>
            <a href="{verify_url}" style="display: inline-block; background: linear-gradient(135deg, #FF5500, #FF7700); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verifikuj Email</a>
            <p style="color: #999; font-size: 12px; margin: 24px 0 0;">Link ističe za 24 sata.<br>Ako nisi ti kreirao nalog, ignoriši ovaj email.</p>
        </div>
    </div>
    """
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client_http:
            response = await client_http.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": "Verifikuj svoj Narucify nalog",
                    "html": html_body
                }
            )
            logger.info(f"Resend API response: status={response.status_code}, body={response.text}")
            if response.status_code in (200, 201, 202):
                logger.info(f"Verification email sent successfully to {to_email}")
                return {"success": True}
            else:
                logger.error(f"Resend API error: {response.status_code} - {response.text}")
                return {"success": False, "error": f"Resend API {response.status_code}: {response.text}"}
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
        return {"success": False, "error": str(e)}

async def send_resend_verification_email(to_email: str, verification_token: str):
    """Resend the verification email (for resend button)"""
    return await send_verification_email(to_email, verification_token)

# Rate limiting - simple in-memory store
rate_limit_store = defaultdict(list)
RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', 30))
RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', 60))

# Audit log
async def log_audit(user_id: str, action: str, details: dict = None):
    """Log important actions for audit trail"""
    audit_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip": None  # Will be set by middleware if needed
    }
    await db.audit_logs.insert_one(audit_doc)

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', ''),
    secure=True
)

# PayPal Configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', '')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')
PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"

async def get_paypal_access_token():
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        resp.raise_for_status()
        return resp.json()["access_token"]

# Notification helper
async def create_notification(user_id: str, title: str, message: str, notification_type: str = "info", reference_id: str = None):
    notif_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "reference_id": reference_id,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)

app = FastAPI(
    title="Narucify API",
    description="Narucify - API za Instagram/WhatsApp prodavce",
    version="1.0.0",
)
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


# ==================== STARTUP & INDEXES ====================

@app.on_event("startup")
async def startup_db():
    """Create MongoDB indexes for optimal query performance"""
    try:
        # Users indexes
        await db.users.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)
        await db.users.create_index("referral_code", unique=True, sparse=True)
        # Drop old verification_token index (may have been created without sparse)
        try:
            await db.users.drop_index("verification_token_1")
        except Exception:
            pass
        # Remove null verification_token from existing users so sparse index works
        await db.users.update_many(
            {"verification_token": None},
            {"$unset": {"verification_token": "", "verification_token_expires": ""}}
        )
        await db.users.create_index("verification_token", unique=True, sparse=True)

        # Products indexes
        await db.products.create_index("id", unique=True)
        await db.products.create_index("user_id")
        await db.products.create_index([("user_id", 1), ("show_in_shop", 1)])

        # Orders indexes
        await db.orders.create_index("id", unique=True)
        await db.orders.create_index("user_id")
        await db.orders.create_index("link_token", unique=True)
        await db.orders.create_index("tracking_id", unique=True, sparse=True)
        await db.orders.create_index([("user_id", 1), ("status", 1)])
        await db.orders.create_index([("user_id", 1), ("created_at", -1)])

        # Customers indexes
        await db.customers.create_index("id", unique=True)
        await db.customers.create_index("user_id")
        await db.customers.create_index([("user_id", 1), ("phone", 1)], unique=True)

        # Events indexes
        await db.events.create_index("id", unique=True)
        await db.events.create_index("storefront_id")
        await db.events.create_index([("event_type", 1), ("timestamp", -1)])

        # Audit logs indexes
        await db.audit_logs.create_index("id", unique=True)
        await db.audit_logs.create_index([("user_id", 1), ("timestamp", -1)])

        # Expenses indexes
        await db.expenses.create_index("id", unique=True)
        await db.expenses.create_index("user_id")
        await db.expenses.create_index([("user_id", 1), ("date", -1)])

        # Notifications indexes
        await db.notifications.create_index("id", unique=True)
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        await db.notifications.create_index([("user_id", 1), ("read", 1)])

        # Coupons indexes
        await db.coupons.create_index("id", unique=True)
        await db.coupons.create_index("user_id")
        await db.coupons.create_index([("user_id", 1), ("code", 1)], unique=True)

        logger.info("MongoDB indexes created successfully")

        # Verify connection
        await client.admin.command('ping')
        logger.info("MongoDB connection verified")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Server starting in DEGRADED mode - database unavailable")

@app.on_event("shutdown")
async def shutdown_db():
    """Close MongoDB connection on shutdown"""
    client.close()
    logger.info("MongoDB connection closed")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    business_name: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    business_name: str
    created_at: str
    features: Optional[Dict[str, bool]] = None
    logo_url: Optional[str] = None
    referral_code: Optional[str] = None
    badges: Optional[List[str]] = None
    is_pro: Optional[bool] = False
    default_delivery_days: Optional[int] = 3

class FeatureAccess(BaseModel):
    analytics: bool = False
    finances: bool = False
    customer_management: bool = False
    email_marketing: bool = False
    inventory_view: bool = False
    custom_branding: bool = False
    priority_support: bool = False

class UpdateUserFeatures(BaseModel):
    features: Dict[str, bool]

class UpdateUserProfile(BaseModel):
    logo_url: Optional[str] = None
    default_delivery_days: Optional[int] = None
    shop_theme: Optional[str] = None
    shop_description: Optional[str] = None
    shop_banner_url: Optional[str] = None
    # Social contact links
    shop_instagram: Optional[str] = None
    shop_whatsapp: Optional[str] = None
    shop_viber: Optional[str] = None
    # Feature toggles
    shop_show_low_stock: Optional[bool] = None
    shop_show_share: Optional[bool] = None
    shop_quick_order: Optional[bool] = None
    shop_vacation_mode: Optional[bool] = None
    shop_vacation_message: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    old_price: Optional[float] = None
    stock: int = 0
    image_url: Optional[str] = ""
    show_in_shop: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    show_in_shop: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    price: float
    old_price: Optional[float] = None
    stock: int
    image_url: str
    created_at: str
    show_in_shop: bool = False

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    notes: Optional[str] = ""
    estimated_delivery_days: Optional[int] = None

class CustomerDataSubmit(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    postal_code: Optional[str] = ""
    email: Optional[str] = ""
    subscribe_promo: bool = False
    payment_method: str = "cash_on_delivery"

class OrderStatusUpdate(BaseModel):
    status: str
    estimated_delivery_days: Optional[int] = None

class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_number: str
    link_token: str
    tracking_id: Optional[str] = None
    items: List[dict]
    total: float
    status: str
    customer: Optional[dict] = None
    notes: str
    created_at: str
    confirmed_at: Optional[str] = None
    estimated_delivery_days: Optional[int] = None

class DashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    total_revenue: float
    total_products: int
    low_stock_products: int
    total_customers: int

class AdminStats(BaseModel):
    total_users: int
    total_orders_platform: int
    total_revenue_platform: float
    total_products_platform: int
    users_with_analytics: int
    users_with_finances: int
    users_with_customer_management: int
    users_with_email_marketing: int

class ReferralCreate(BaseModel):
    referral_code: str

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        await client.admin.command('ping')
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/test-email/{email}")
async def test_email(email: str):
    """Test endpoint to debug Resend email sending"""
    test_token = str(uuid.uuid4())
    result = await send_verification_email(email, test_token)
    return {
        "email_to": email,
        "resend_api_key_set": bool(RESEND_API_KEY),
        "resend_api_key_prefix": RESEND_API_KEY[:12] + "..." if RESEND_API_KEY else "NOT SET",
        "from_email": RESEND_FROM_EMAIL,
        "frontend_url": FRONTEND_URL,
        "verify_url": f"{FRONTEND_URL}/verify-email/{test_token}",
        "result": result
    }

# ==================== AUTH HELPERS ====================

def check_rate_limit(identifier: str) -> bool:
    """Check if request should be rate limited"""
    current_time = time.time()
    # Clean old entries
    rate_limit_store[identifier] = [t for t in rate_limit_store[identifier] if current_time - t < RATE_LIMIT_WINDOW]
    # Check limit
    if len(rate_limit_store[identifier]) >= RATE_LIMIT_REQUESTS:
        return False
    rate_limit_store[identifier].append(current_time)
    return True

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("is_admin"):
            return {"id": "admin", "email": payload["email"], "is_admin": True}
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        return {"id": "admin", "email": payload["email"], "is_admin": True}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

def generate_referral_code():
    return str(uuid.uuid4())[:8].upper()

def check_and_award_badges(user_id: str, orders_count: int) -> List[str]:
    badges = []
    if orders_count >= 10:
        badges.append("starter_seller")
    if orders_count >= 50:
        badges.append("active_seller")
    if orders_count >= 100:
        badges.append("power_seller")
    if orders_count >= 500:
        badges.append("super_seller")
    return badges

@api_router.post("/auth/register", response_model=dict)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    referral_code = generate_referral_code()
    verification_token = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "business_name": data.business_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "referral_code": referral_code,
        "referred_by": None,
        "referral_count": 0,
        "is_pro": False,
        "pro_expires_at": None,
        "logo_url": None,
        "default_delivery_days": 3,
        "badges": [],
        "email_verified": True,
        "onboarding_completed": False,
        "features": {
            "analytics": False,
            "finances": False,
            "customer_management": False,
            "email_marketing": False,
            "inventory_view": False,
            "custom_branding": False,
            "priority_support": False
        }
    }
    
    # Check if referred by someone
    if data.referral_code:
        referrer = await db.users.find_one({"referral_code": data.referral_code.upper()})
        if referrer:
            user_doc["referred_by"] = referrer["id"]
            # Award both users 1 month PRO
            pro_expires = datetime.now(timezone.utc) + timedelta(days=30)
            user_doc["is_pro"] = True
            user_doc["pro_expires_at"] = pro_expires.isoformat()
            # Update referrer
            await db.users.update_one(
                {"id": referrer["id"]},
                {
                    "$inc": {"referral_count": 1},
                    "$set": {
                        "is_pro": True,
                        "pro_expires_at": pro_expires.isoformat()
                    }
                }
            )
    
    await db.users.insert_one(user_doc)
    
    # Auto-login: generate token immediately
    token = create_token(user_id, data.email)
    await log_audit(user_id, "register", {"email": data.email})
    
    return {
        "message": "Registration successful. Your account has been activated.",
        "email": data.email,
        "requires_verification": False,
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "business_name": data.business_name,
            "referral_code": referral_code,
            "is_pro": user_doc["is_pro"],
            "onboarding_completed": False,
            "features": user_doc["features"]
        }
    }


@api_router.get("/auth/verify-email/{token}", response_model=dict)
async def verify_email(token: str):
    """Verify user email with token"""
    user = await db.users.find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    # Check if token expired
    expires = datetime.fromisoformat(user["verification_token_expires"])
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")
    
    # Activate account
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "email_verified": True,
                "verification_token": None,
                "verification_token_expires": None
            }
        }
    )
    
    await log_audit(user["id"], "email_verified", {"email": user["email"]})

    # Return token so frontend can auto-login
    auth_token = create_token(user["id"], user["email"])
    return {
        "message": "Email verified successfully",
        "token": auth_token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "business_name": user["business_name"],
            "referral_code": user.get("referral_code"),
            "is_pro": user.get("is_pro", False),
            "features": user.get("features", {})
        }
    }


@api_router.post("/auth/resend-verification", response_model=dict)
async def resend_verification(data: dict):
    """Resend verification email"""
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if email exists
        return {"message": "If this email is registered, a verification link has been sent."}
    
    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email is already verified")
    
    # Generate new token
    new_token = str(uuid.uuid4())
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "verification_token": new_token,
                "verification_token_expires": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
            }
        }
    )
    
    await send_verification_email(email, new_token)
    
    return {"message": "If this email is registered, a verification link has been sent."}


@api_router.post("/auth/login", response_model=dict)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Email verification disabled for now (no custom domain for Resend)
    # if not user.get("email_verified", True):
    #     raise HTTPException(status_code=403, detail="Email not verified.")
    
    # Log audit
    await log_audit(user["id"], "login", {"email": data.email})
    
    # Ensure features field exists for older users
    if "features" not in user:
        user["features"] = {
            "analytics": False,
            "finances": False,
            "customer_management": False,
            "email_marketing": False,
            "inventory_view": False,
            "custom_branding": False,
            "priority_support": False
        }
        await db.users.update_one({"id": user["id"]}, {"$set": {"features": user["features"]}})
    
    # Check and update badges based on order count
    orders_count = await db.orders.count_documents({"user_id": user["id"], "status": {"$ne": "canceled"}})
    badges = check_and_award_badges(user["id"], orders_count)
    if badges != user.get("badges", []):
        await db.users.update_one({"id": user["id"]}, {"$set": {"badges": badges}})
        user["badges"] = badges
    
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "business_name": user["business_name"],
            "referral_code": user.get("referral_code"),
            "referral_count": user.get("referral_count", 0),
            "is_pro": user.get("is_pro", False),
            "badges": user.get("badges", []),
            "logo_url": user.get("logo_url"),
            "default_delivery_days": user.get("default_delivery_days", 3),
            "features": user.get("features", {})
        }
    }

@api_router.get("/auth/me", response_model=dict)
async def get_me(user: dict = Depends(get_current_user)):
    if user.get("is_admin"):
        return {
            "id": "admin",
            "email": user["email"],
            "business_name": "Super Admin",
            "is_admin": True
        }
    
    # Ensure features field exists
    if "features" not in user:
        user["features"] = {
            "analytics": False,
            "finances": False,
            "customer_management": False,
            "email_marketing": False,
            "inventory_view": False,
            "custom_branding": False,
            "priority_support": False
        }
    
    # Check and update badges based on order count
    orders_count = await db.orders.count_documents({"user_id": user["id"], "status": {"$ne": "canceled"}})
    badges = check_and_award_badges(user["id"], orders_count)
    old_badges = user.get("badges", [])
    badges_seen = user.get("badges_seen", [])
    
    # New badges are ones not yet seen by user
    new_badges = [b for b in badges if b not in badges_seen]
    
    if badges != old_badges:
        await db.users.update_one({"id": user["id"]}, {"$set": {"badges": badges}})
        user["badges"] = badges
    
    return {
        "id": user["id"],
        "email": user["email"],
        "business_name": user["business_name"],
        "created_at": user.get("created_at", ""),
        "referral_code": user.get("referral_code"),
        "referral_count": user.get("referral_count", 0),
        "is_pro": user.get("is_pro", False),
        "badges": badges,
        "new_badges": new_badges,  # Badges not yet seen
        "logo_url": user.get("logo_url"),
        "default_delivery_days": user.get("default_delivery_days", 3),
        "onboarding_completed": user.get("onboarding_completed", True),
        "features": user.get("features", {}),
        "shop_name": user.get("shop_name"),
        "shop_description": user.get("shop_description"),
        "shop_theme": user.get("shop_theme"),
        "shop_banner_url": user.get("shop_banner_url"),
        "shop_instagram": user.get("shop_instagram"),
        "shop_whatsapp": user.get("shop_whatsapp"),
        "shop_phone": user.get("shop_phone"),
        "shop_vacation_mode": user.get("shop_vacation_mode", False),
        "shop_vacation_message": user.get("shop_vacation_message"),
    }

@api_router.post("/auth/badges-seen")
async def mark_badges_seen(user: dict = Depends(get_current_user)):
    """Mark all current badges as seen by user"""
    badges = user.get("badges", [])
    await db.users.update_one({"id": user["id"]}, {"$set": {"badges_seen": badges}})
    return {"success": True}

@api_router.put("/auth/profile")
async def update_profile(data: UpdateUserProfile, user: dict = Depends(get_current_user)):
    update_data = {}
    if data.logo_url is not None:
        update_data["logo_url"] = data.logo_url
    if data.default_delivery_days is not None:
        update_data["default_delivery_days"] = data.default_delivery_days
    if data.shop_theme is not None:
        valid_themes = ["elegance", "midnight", "sunset", "nature", "ocean", "minimal"]
        if data.shop_theme in valid_themes:
            update_data["shop_theme"] = data.shop_theme
    if data.shop_description is not None:
        update_data["shop_description"] = data.shop_description[:500]
    if data.shop_banner_url is not None:
        update_data["shop_banner_url"] = data.shop_banner_url
    # Social links
    if data.shop_instagram is not None:
        update_data["shop_instagram"] = data.shop_instagram[:100]
    if data.shop_whatsapp is not None:
        update_data["shop_whatsapp"] = data.shop_whatsapp[:30]
    if data.shop_viber is not None:
        update_data["shop_viber"] = data.shop_viber[:30]
    # Feature toggles
    if data.shop_show_low_stock is not None:
        update_data["shop_show_low_stock"] = data.shop_show_low_stock
    if data.shop_show_share is not None:
        update_data["shop_show_share"] = data.shop_show_share
    if data.shop_quick_order is not None:
        update_data["shop_quick_order"] = data.shop_quick_order
    if data.shop_vacation_mode is not None:
        update_data["shop_vacation_mode"] = data.shop_vacation_mode
    if data.shop_vacation_message is not None:
        update_data["shop_vacation_message"] = data.shop_vacation_message[:300]
    
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

# ==================== ADMIN AUTH ====================

@api_router.post("/admin/login", response_model=dict)
async def admin_login(data: UserLogin):
    if data.email != ADMIN_EMAIL or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_token("admin", ADMIN_EMAIL, is_admin=True)
    return {
        "token": token,
        "user": {
            "id": "admin",
            "email": ADMIN_EMAIL,
            "business_name": "Super Admin",
            "is_admin": True
        }
    }

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get platform-wide statistics using MongoDB aggregation for performance"""
    # Count totals efficiently
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    
    # Revenue aggregation
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0
    
    # Feature usage aggregation
    feature_pipeline = [
        {"$group": {
            "_id": None,
            "analytics": {"$sum": {"$cond": [{"$ifNull": ["$features.analytics", False]}, 1, 0]}},
            "finances": {"$sum": {"$cond": [{"$ifNull": ["$features.finances", False]}, 1, 0]}},
            "customer_management": {"$sum": {"$cond": [{"$ifNull": ["$features.customer_management", False]}, 1, 0]}},
            "email_marketing": {"$sum": {"$cond": [{"$ifNull": ["$features.email_marketing", False]}, 1, 0]}}
        }}
    ]
    feature_result = await db.users.aggregate(feature_pipeline).to_list(1)
    features = feature_result[0] if feature_result else {}
    
    return AdminStats(
        total_users=total_users,
        total_orders_platform=total_orders,
        total_revenue_platform=total_revenue,
        total_products_platform=total_products,
        users_with_analytics=features.get("analytics", 0),
        users_with_finances=features.get("finances", 0),
        users_with_customer_management=features.get("customer_management", 0),
        users_with_email_marketing=features.get("email_marketing", 0)
    )

@api_router.get("/admin/users")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(10000)
    
    # Pre-aggregate stats for all users in bulk (much faster than N+1 queries)
    order_stats_pipeline = [
        {"$group": {
            "_id": "$user_id",
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, "$total", 0]}}
        }}
    ]
    product_stats_pipeline = [
        {"$group": {"_id": "$user_id", "total_products": {"$sum": 1}}}
    ]
    
    order_stats = {s["_id"]: s for s in await db.orders.aggregate(order_stats_pipeline).to_list(10000)}
    product_stats = {s["_id"]: s for s in await db.products.aggregate(product_stats_pipeline).to_list(10000)}
    
    result = []
    for user in users:
        uid = user["id"]
        o_stats = order_stats.get(uid, {})
        p_stats = product_stats.get(uid, {})
        
        if "features" not in user:
            user["features"] = {
                "analytics": False,
                "finances": False,
                "customer_management": False,
                "email_marketing": False
            }
        
        result.append({
            **user,
            "stats": {
                "total_orders": o_stats.get("total_orders", 0),
                "total_products": p_stats.get("total_products", 0),
                "total_revenue": o_stats.get("total_revenue", 0)
            }
        })
    
    return result

@api_router.get("/admin/users/{user_id}")
async def get_user_detail(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).to_list(10000)
    products = await db.products.find({"user_id": user_id}, {"_id": 0}).to_list(10000)
    customers = await db.customers.find({"user_id": user_id}, {"_id": 0}).to_list(10000)
    
    completed_orders = [o for o in orders if o.get("status") == "completed"]
    revenue = sum(o.get("total", 0) for o in completed_orders)
    
    return {
        **user,
        "stats": {
            "total_orders": len(orders),
            "total_products": len(products),
            "total_customers": len(customers),
            "total_revenue": revenue,
            "completed_orders": len(completed_orders)
        },
        "recent_orders": orders[:10]
    }

@api_router.put("/admin/users/{user_id}/features")
async def update_user_features(user_id: str, data: UpdateUserFeatures, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"features": data.features}}
    )
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return updated_user

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user and all their data
    await db.users.delete_one({"id": user_id})
    await db.products.delete_many({"user_id": user_id})
    await db.orders.delete_many({"user_id": user_id})
    await db.customers.delete_many({"user_id": user_id})
    
    return {"message": "User and all related data deleted"}

# ==================== PRODUCTS ROUTES ====================

@api_router.post("/products", response_model=ProductResponse)
async def create_product(data: ProductCreate, user: dict = Depends(get_current_user)):
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "user_id": user["id"],
        "name": data.name,
        "description": data.description or "",
        "price": data.price,
        "old_price": data.old_price,
        "stock": data.stock,
        "image_url": data.image_url or "",
        "show_in_shop": data.show_in_shop,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    return ProductResponse(**product_doc)

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(user: dict = Depends(get_current_user)):
    products = await db.products.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    # Ensure show_in_shop field exists for older products
    for p in products:
        if "show_in_shop" not in p:
            p["show_in_shop"] = False
    return [ProductResponse(**p) for p in products]

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id, "user_id": user["id"]}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if "show_in_shop" not in product:
        product["show_in_shop"] = False
    return ProductResponse(**product)

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, data: ProductUpdate, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id, "user_id": user["id"]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return ProductResponse(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== ORDERS ROUTES ====================

def generate_order_number():
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(data: OrderCreate, user: dict = Depends(get_current_user)):
    items_with_details = []
    total = 0
    
    for item in data.items:
        product = await db.products.find_one({"id": item.product_id, "user_id": user["id"]}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        item_total = product["price"] * item.quantity
        items_with_details.append({
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "image_url": product["image_url"],
            "subtotal": item_total
        })
        total += item_total
    
    order_id = str(uuid.uuid4())
    link_token = str(uuid.uuid4())[:12]
    tracking_id = str(uuid.uuid4())[:8].upper()  # Short tracking ID for customers
    order_number = generate_order_number()
    
    order_doc = {
        "id": order_id,
        "user_id": user["id"],
        "order_number": order_number,
        "link_token": link_token,
        "tracking_id": tracking_id,
        "items": items_with_details,
        "total": total,
        "status": "pending_customer",
        "customer": None,
        "notes": data.notes or "",
        "estimated_delivery_days": data.estimated_delivery_days,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "confirmed_at": None
    }
    
    # Use user's default delivery days if not specified
    if order_doc["estimated_delivery_days"] is None:
        seller = await db.users.find_one({"id": user["id"]}, {"_id": 0})
        order_doc["estimated_delivery_days"] = seller.get("default_delivery_days", 3)
    
    await db.orders.insert_one(order_doc)
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [OrderResponse(**o) for o in orders]

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse(**order)

@api_router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, data: OrderStatusUpdate, user: dict = Depends(get_current_user)):
    valid_statuses = ["pending_customer", "new", "confirmed", "shipped", "completed", "canceled"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {"status": data.status}
    if data.estimated_delivery_days is not None:
        update_data["estimated_delivery_days"] = data.estimated_delivery_days
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return OrderResponse(**updated)

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, user: dict = Depends(get_current_user)):
    result = await db.orders.delete_one({"id": order_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

# ==================== MINI SHOP ROUTES ====================

@api_router.get("/public/shop/{user_id}")
async def get_public_shop(user_id: str):
    """Public mini shop - shows up to 10 products marked as show_in_shop"""
    seller = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    products = await db.products.find(
        {"user_id": user_id, "show_in_shop": True, "stock": {"$gt": 0}},
        {"_id": 0}
    ).limit(10).to_list(10)
    
    return {
        "seller_name": seller["business_name"],
        "logo_url": seller.get("logo_url"),
        "is_pro": seller.get("is_pro", False),
        "shop_theme": seller.get("shop_theme", "elegance"),
        "shop_description": seller.get("shop_description", ""),
        "shop_banner_url": seller.get("shop_banner_url", ""),
        # Social & contact
        "shop_instagram": seller.get("shop_instagram", ""),
        "shop_whatsapp": seller.get("shop_whatsapp", ""),
        "shop_viber": seller.get("shop_viber", ""),
        # Feature toggles
        "shop_show_low_stock": seller.get("shop_show_low_stock", False),
        "shop_show_share": seller.get("shop_show_share", False),
        "shop_quick_order": seller.get("shop_quick_order", False),
        "shop_vacation_mode": seller.get("shop_vacation_mode", False),
        "shop_vacation_message": seller.get("shop_vacation_message", ""),
        "products": products
    }

@api_router.put("/products/{product_id}/shop")
async def toggle_product_in_shop(product_id: str, user: dict = Depends(get_current_user)):
    """Toggle product visibility in mini shop"""
    product = await db.products.find_one({"id": product_id, "user_id": user["id"]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if adding to shop - limit to 10
    if not product.get("show_in_shop", False):
        shop_count = await db.products.count_documents({"user_id": user["id"], "show_in_shop": True})
        if shop_count >= 10:
            raise HTTPException(status_code=400, detail="Maximum 10 products in shop")
    
    new_value = not product.get("show_in_shop", False)
    await db.products.update_one({"id": product_id}, {"$set": {"show_in_shop": new_value}})
    
    return {"show_in_shop": new_value}

# ==================== PUBLIC SHOP ORDER ====================

class ShopOrderItem(BaseModel):
    product_id: str
    quantity: int = 1

class ShopCustomerData(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    postal_code: Optional[str] = ""
    email: Optional[str] = ""
    payment_method: str = "cash_on_delivery"
    subscribe_promo: bool = False

class ShopOrderCreate(BaseModel):
    items: List[ShopOrderItem]
    customer: ShopCustomerData
    coupon_code: Optional[str] = None

@api_router.post("/public/shop/{user_id}/order")
async def create_shop_order(user_id: str, data: ShopOrderCreate, request: Request):
    """Create order directly from mini storefront"""
    # Rate limit by IP
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"order_{client_ip}"):
        raise HTTPException(status_code=429, detail="Previše zahteva. Pokušaj ponovo za minut.")
    
    seller = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    items_with_details = []
    total = 0
    
    for item in data.items:
        product = await db.products.find_one({
            "id": item.product_id, 
            "user_id": user_id,
            "show_in_shop": True
        }, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found in shop")
        
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        item_total = product["price"] * item.quantity
        items_with_details.append({
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "image_url": product.get("image_url", ""),
            "subtotal": item_total
        })
        total += item_total
    
    # Apply coupon discount
    discount = 0
    applied_coupon = None
    if data.coupon_code:
        coupon = await db.coupons.find_one({
            "user_id": user_id,
            "code": data.coupon_code.strip().upper(),
            "is_active": True
        })
        if coupon:
            # Check expiry and usage
            valid = True
            if coupon.get("expires_at"):
                try:
                    expires = datetime.fromisoformat(coupon["expires_at"].replace("Z", "+00:00"))
                    if expires < datetime.now(timezone.utc):
                        valid = False
                except (ValueError, TypeError):
                    pass
            if coupon.get("max_uses") and coupon["used_count"] >= coupon["max_uses"]:
                valid = False
            if coupon.get("min_order_amount") and total < coupon["min_order_amount"]:
                valid = False
            
            if valid:
                if coupon["discount_type"] == "percent":
                    discount = total * (coupon["discount_value"] / 100)
                else:
                    discount = min(coupon["discount_value"], total)
                applied_coupon = coupon["code"]
                total = max(0, total - discount)
    
    # Create order
    order_id = str(uuid.uuid4())
    link_token = str(uuid.uuid4())[:12]
    tracking_id = str(uuid.uuid4())[:8].upper()
    order_number = generate_order_number()
    
    # Decrease stock
    for item in data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    # Save customer
    customer_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "full_name": data.customer.full_name,
        "phone": data.customer.phone,
        "address": data.customer.address,
        "city": data.customer.city,
        "postal_code": data.customer.postal_code,
        "email": data.customer.email,
        "subscribe_promo": data.customer.subscribe_promo,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_customer = await db.customers.find_one({
        "user_id": user_id,
        "phone": data.customer.phone
    })
    if not existing_customer:
        await db.customers.insert_one(customer_doc)
    
    confirmed_at = datetime.now(timezone.utc).isoformat()
    order_doc = {
        "id": order_id,
        "user_id": user_id,
        "order_number": order_number,
        "link_token": link_token,
        "tracking_id": tracking_id,
        "items": items_with_details,
        "total": total,
        "status": "new",
        "customer": {
            "full_name": data.customer.full_name,
            "phone": data.customer.phone,
            "address": data.customer.address,
            "city": data.customer.city,
            "postal_code": data.customer.postal_code,
            "email": data.customer.email,
            "payment_method": data.customer.payment_method
        },
        "notes": "",
        "estimated_delivery_days": seller.get("default_delivery_days", 3),
        "coupon_code": applied_coupon,
        "discount": discount,
        "created_at": confirmed_at,
        "confirmed_at": confirmed_at
    }
    
    await db.orders.insert_one(order_doc)
    
    # Log audit
    await log_audit(user_id, "order_created_from_storefront", {"order_number": order_number})
    
    # Create notification for seller
    items_summary = ", ".join([f"{it['name']} x{it['quantity']}" for it in items_with_details[:3]])
    await create_notification(
        user_id,
        "Nova porudžbina! 🛒",
        f"{data.customer.full_name} je naručio/la: {items_summary} - {total:,.0f} RSD",
        "order",
        order_id
    )
    
    # Apply coupon if provided
    if applied_coupon:
        await db.coupons.update_one(
            {"user_id": user_id, "code": applied_coupon},
            {"$inc": {"used_count": 1}}
        )
    
    return {
        "success": True,
        "order_number": order_number,
        "tracking_id": tracking_id
    }

# ==================== OPEN GRAPH META ENDPOINTS ====================

@api_router.get("/og/storefront/{user_id}", response_class=HTMLResponse)
async def get_storefront_og(user_id: str, request: Request):
    """Generate Open Graph meta tags for storefront sharing on Instagram/WhatsApp"""
    seller = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    products = await db.products.find({
        "user_id": user_id,
        "show_in_shop": True,
        "stock": {"$gt": 0}
    }, {"_id": 0}).to_list(10)
    
    # Get first product image for preview
    preview_image = ""
    if products and products[0].get("image_url"):
        preview_image = products[0]["image_url"]
    
    business_name = seller.get("business_name", "Narucify")
    product_count = len(products)
    
    frontend_url = FRONTEND_URL.rstrip('/')
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{business_name} - Ponuda</title>
    <meta property="og:title" content="{business_name}" />
    <meta property="og:description" content="Pogledaj ponudu - {product_count} proizvoda" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{frontend_url}/shop/{user_id}" />
    <meta property="og:image" content="{preview_image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{business_name}" />
    <meta name="twitter:description" content="Pogledaj ponudu - {product_count} proizvoda" />
    <meta name="twitter:image" content="{preview_image}" />
    <script>window.location.href = '{frontend_url}/shop/{user_id}';</script>
</head>
<body>
    <p>Redirecting to {business_name}...</p>
</body>
</html>"""
    return HTMLResponse(content=html)

@api_router.get("/og/product/{product_id}", response_class=HTMLResponse)
async def get_product_og(product_id: str, request: Request):
    """Generate Open Graph meta tags for single product sharing"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    seller = await db.users.find_one({"id": product["user_id"]}, {"_id": 0})
    business_name = seller.get("business_name", "Narucify") if seller else "Narucify"
    
    price_formatted = f"{int(product['price']):,}".replace(",", ".") + " RSD"
    image = product.get("image_url", "")
    
    frontend_url = FRONTEND_URL.rstrip('/')
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{product['name']} - {price_formatted}</title>
    <meta property="og:title" content="{product['name']}" />
    <meta property="og:description" content="{price_formatted} • {business_name}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="{frontend_url}/product/{product_id}" />
    <meta property="og:image" content="{image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="product:price:amount" content="{product['price']}" />
    <meta property="product:price:currency" content="RSD" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{product['name']}" />
    <meta name="twitter:description" content="{price_formatted} • {business_name}" />
    <meta name="twitter:image" content="{image}" />
    <script>window.location.href = '{frontend_url}/product/{product_id}';</script>
</head>
<body>
    <p>Redirecting to {product['name']}...</p>
</body>
</html>"""
    return HTMLResponse(content=html)

# ==================== EVENT TRACKING ====================

class TrackEventData(BaseModel):
    event_type: str  # storefront_view, product_view, checkout_start, order_submit, order_abandon
    storefront_id: Optional[str] = None
    product_id: Optional[str] = None
    order_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[dict] = None

@api_router.post("/track/event")
async def track_event(data: TrackEventData, request: Request):
    """Track events for analytics funnel"""
    # Rate limit by IP
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"track_{client_ip}"):
        raise HTTPException(status_code=429, detail="Too many requests")
    
    event_doc = {
        "id": str(uuid.uuid4()),
        "event_type": data.event_type,
        "storefront_id": data.storefront_id,
        "product_id": data.product_id,
        "order_id": data.order_id,
        "session_id": data.session_id,
        "metadata": data.metadata or {},
        "ip": client_ip,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)
    return {"success": True}

# ==================== PUBLIC ORDER ROUTES ====================

@api_router.get("/public/order/{link_token}")
async def get_public_order(link_token: str):
    order = await db.orders.find_one({"link_token": link_token}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get seller info
    seller = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "password": 0})
    
    return {
        "order_number": order["order_number"],
        "tracking_id": order.get("tracking_id"),
        "items": order["items"],
        "total": order["total"],
        "status": order["status"],
        "notes": order["notes"],
        "seller_name": seller["business_name"] if seller else "Unknown"
    }

@api_router.get("/public/track/{tracking_id}")
async def track_order(tracking_id: str):
    """Public endpoint for customers to track their order status"""
    order = await db.orders.find_one({"tracking_id": tracking_id.upper()}, {"_id": 0})
    if not order:
        # Also try link_token for backwards compatibility
        order = await db.orders.find_one({"link_token": tracking_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get seller info
    seller = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "password": 0})
    
    return {
        "order_number": order["order_number"],
        "tracking_id": order.get("tracking_id"),
        "items": order["items"],
        "total": order["total"],
        "status": order["status"],
        "customer": order.get("customer"),
        "created_at": order["created_at"],
        "confirmed_at": order.get("confirmed_at"),
        "seller_name": seller["business_name"] if seller else "Unknown"
    }

@api_router.post("/public/order/{link_token}/confirm")
async def confirm_public_order(link_token: str, customer_data: CustomerDataSubmit):
    order = await db.orders.find_one({"link_token": link_token})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "pending_customer":
        raise HTTPException(status_code=400, detail="Order already confirmed or processed")
    
    # Verify stock availability
    for item in order["items"]:
        product = await db.products.find_one({"id": item["product_id"]})
        if product and product["stock"] < item["quantity"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {item['name']}. Available: {product['stock']}"
            )
    
    # Decrease stock
    for item in order["items"]:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
    
    # Save customer data
    customer_doc = {
        "id": str(uuid.uuid4()),
        "user_id": order["user_id"],
        "full_name": customer_data.full_name,
        "phone": customer_data.phone,
        "address": customer_data.address,
        "city": customer_data.city,
        "postal_code": customer_data.postal_code,
        "email": customer_data.email,
        "subscribe_promo": customer_data.subscribe_promo,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if customer exists, if not create
    existing_customer = await db.customers.find_one({
        "user_id": order["user_id"],
        "phone": customer_data.phone
    })
    if not existing_customer:
        await db.customers.insert_one(customer_doc)
    
    # Update order
    confirmed_at = datetime.now(timezone.utc).isoformat()
    await db.orders.update_one(
        {"link_token": link_token},
        {
            "$set": {
                "status": "new",
                "customer": {
                    "full_name": customer_data.full_name,
                    "phone": customer_data.phone,
                    "address": customer_data.address,
                    "city": customer_data.city,
                    "postal_code": customer_data.postal_code,
                    "email": customer_data.email,
                    "payment_method": customer_data.payment_method
                },
                "confirmed_at": confirmed_at
            }
        }
    )
    
    return {
        "success": True,
        "order_number": order["order_number"],
        "tracking_id": order.get("tracking_id", order["link_token"]),
        "message": "Order confirmed successfully"
    }

# ==================== CUSTOMERS ROUTES ====================

@api_router.get("/customers")
async def get_customers(user: dict = Depends(get_current_user)):
    customers = await db.customers.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    return customers

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    """Get seller dashboard stats using MongoDB aggregation"""
    uid = user["id"]
    
    # Orders aggregation
    order_pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {
            "_id": None,
            "total_confirmed": {"$sum": {"$cond": [{"$not": [{"$in": ["$status", ["pending_customer", "canceled"]]}]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$in": ["$status", ["new", "confirmed"]]}, 1, 0]}},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
            "revenue": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, "$total", 0]}}
        }}
    ]
    order_result = await db.orders.aggregate(order_pipeline).to_list(1)
    o = order_result[0] if order_result else {}
    
    total_products = await db.products.count_documents({"user_id": uid})
    low_stock = await db.products.count_documents({"user_id": uid, "stock": {"$lte": 5}})
    total_customers = await db.customers.count_documents({"user_id": uid})
    
    return DashboardStats(
        total_orders=o.get("total_confirmed", 0),
        pending_orders=o.get("pending", 0),
        completed_orders=o.get("completed", 0),
        total_revenue=o.get("revenue", 0.0),
        total_products=total_products,
        low_stock_products=low_stock,
        total_customers=total_customers
    )

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Narucify API v1.0"}

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/overview")
async def get_analytics_overview(
    period: str = "30d",
    user: dict = Depends(get_current_user)
):
    """Get analytics overview: revenue trends, order stats, top products"""
    uid = user["id"]
    
    # Calculate date range
    days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
    days = days_map.get(period, 30)
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Daily revenue & orders aggregation
    daily_pipeline = [
        {"$match": {
            "user_id": uid,
            "created_at": {"$gte": start_date},
            "status": {"$nin": ["pending_customer", "canceled"]}
        }},
        {"$addFields": {
            "day": {"$substr": ["$created_at", 0, 10]}
        }},
        {"$group": {
            "_id": "$day",
            "orders": {"$sum": 1},
            "revenue": {"$sum": "$total"}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily_data = await db.orders.aggregate(daily_pipeline).to_list(365)
    
    # Top products by quantity sold
    top_products_pipeline = [
        {"$match": {
            "user_id": uid,
            "status": {"$nin": ["pending_customer", "canceled"]}
        }},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_id",
            "name": {"$first": "$items.name"},
            "total_quantity": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": "$items.subtotal"}
        }},
        {"$sort": {"total_quantity": -1}},
        {"$limit": 10}
    ]
    top_products = await db.orders.aggregate(top_products_pipeline).to_list(10)
    
    # Orders by status
    status_pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    status_data = await db.orders.aggregate(status_pipeline).to_list(10)
    
    # Top cities
    city_pipeline = [
        {"$match": {
            "user_id": uid,
            "customer.city": {"$exists": True, "$ne": ""}
        }},
        {"$group": {
            "_id": "$customer.city",
            "count": {"$sum": 1},
            "revenue": {"$sum": "$total"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_cities = await db.orders.aggregate(city_pipeline).to_list(10)
    
    # Summary stats for the period
    summary_pipeline = [
        {"$match": {
            "user_id": uid,
            "created_at": {"$gte": start_date},
            "status": {"$nin": ["pending_customer", "canceled"]}
        }},
        {"$group": {
            "_id": None,
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$total"},
            "avg_order_value": {"$avg": "$total"}
        }}
    ]
    summary_result = await db.orders.aggregate(summary_pipeline).to_list(1)
    summary = summary_result[0] if summary_result else {}
    
    # Previous period for comparison
    prev_start = (datetime.now(timezone.utc) - timedelta(days=days * 2)).isoformat()
    prev_pipeline = [
        {"$match": {
            "user_id": uid,
            "created_at": {"$gte": prev_start, "$lt": start_date},
            "status": {"$nin": ["pending_customer", "canceled"]}
        }},
        {"$group": {
            "_id": None,
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$total"}
        }}
    ]
    prev_result = await db.orders.aggregate(prev_pipeline).to_list(1)
    prev = prev_result[0] if prev_result else {}
    
    # Calculate growth
    prev_revenue = prev.get("total_revenue", 0)
    curr_revenue = summary.get("total_revenue", 0)
    revenue_growth = ((curr_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
    
    prev_orders = prev.get("total_orders", 0)
    curr_orders = summary.get("total_orders", 0)
    orders_growth = ((curr_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0
    
    return {
        "period": period,
        "summary": {
            "total_orders": curr_orders,
            "total_revenue": round(curr_revenue, 2),
            "avg_order_value": round(summary.get("avg_order_value", 0), 2),
            "revenue_growth": round(revenue_growth, 1),
            "orders_growth": round(orders_growth, 1)
        },
        "daily": [{"date": d["_id"], "orders": d["orders"], "revenue": round(d["revenue"], 2)} for d in daily_data],
        "top_products": [{"name": p["name"], "quantity": p["total_quantity"], "revenue": round(p["total_revenue"], 2)} for p in top_products],
        "order_statuses": {s["_id"]: s["count"] for s in status_data},
        "top_cities": [{"city": c["_id"], "orders": c["count"], "revenue": round(c["revenue"], 2)} for c in top_cities]
    }

# ==================== FINANCES ROUTES ====================

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str = "other"
    date: Optional[str] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None

@api_router.post("/finances/expenses")
async def create_expense(data: ExpenseCreate, user: dict = Depends(get_current_user)):
    """Add a business expense"""
    expense_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "description": data.description,
        "amount": data.amount,
        "category": data.category,
        "date": data.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expenses.insert_one(expense_doc)
    expense_doc.pop("_id", None)
    return expense_doc

@api_router.get("/finances/expenses")
async def get_expenses(
    period: str = "30d",
    user: dict = Depends(get_current_user)
):
    """Get all expenses for the period"""
    days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
    days = days_map.get(period, 30)
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    
    expenses = await db.expenses.find(
        {"user_id": user["id"], "date": {"$gte": start_date}},
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    return expenses

@api_router.delete("/finances/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: dict = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}

@api_router.get("/finances/overview")
async def get_finances_overview(
    period: str = "30d",
    user: dict = Depends(get_current_user)
):
    """Get financial overview: revenue, expenses, profit"""
    uid = user["id"]
    days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
    days = days_map.get(period, 30)
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    start_date_short = start_date[:10]
    
    # Revenue from completed orders
    revenue_pipeline = [
        {"$match": {
            "user_id": uid,
            "created_at": {"$gte": start_date},
            "status": "completed"
        }},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$total"},
            "count": {"$sum": 1}
        }}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    revenue = revenue_result[0] if revenue_result else {"total": 0, "count": 0}
    
    # Monthly revenue breakdown
    monthly_revenue_pipeline = [
        {"$match": {
            "user_id": uid,
            "created_at": {"$gte": start_date},
            "status": "completed"
        }},
        {"$addFields": {
            "month": {"$substr": ["$created_at", 0, 7]}
        }},
        {"$group": {
            "_id": "$month",
            "revenue": {"$sum": "$total"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_revenue = await db.orders.aggregate(monthly_revenue_pipeline).to_list(12)
    
    # Expenses total
    expenses_pipeline = [
        {"$match": {
            "user_id": uid,
            "date": {"$gte": start_date_short}
        }},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$amount"}
        }}
    ]
    expenses_result = await db.expenses.aggregate(expenses_pipeline).to_list(1)
    total_expenses = expenses_result[0]["total"] if expenses_result else 0
    
    # Expenses by category
    category_pipeline = [
        {"$match": {
            "user_id": uid,
            "date": {"$gte": start_date_short}
        }},
        {"$group": {
            "_id": "$category",
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"total": -1}}
    ]
    expenses_by_category = await db.expenses.aggregate(category_pipeline).to_list(20)
    
    total_revenue = revenue.get("total", 0)
    profit = total_revenue - total_expenses
    margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "period": period,
        "revenue": round(total_revenue, 2),
        "expenses": round(total_expenses, 2),
        "profit": round(profit, 2),
        "margin": round(margin, 1),
        "completed_orders": revenue.get("count", 0),
        "monthly": [{"month": m["_id"], "revenue": round(m["revenue"], 2), "orders": m["orders"]} for m in monthly_revenue],
        "expenses_by_category": [{"category": c["_id"], "total": round(c["total"], 2), "count": c["count"]} for c in expenses_by_category]
    }

# ==================== EXPORT ROUTES ====================

from io import BytesIO
from fastapi.responses import StreamingResponse
import csv

@api_router.get("/export/orders/csv")
async def export_orders_csv(user: dict = Depends(get_current_user)):
    """Export all orders as CSV"""
    orders = await db.orders.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    output = BytesIO()
    # Write UTF-8 BOM for Excel compatibility
    output.write(b'\xef\xbb\xbf')
    
    import io
    text_output = io.TextIOWrapper(output, encoding='utf-8', newline='')
    writer = csv.writer(text_output)
    
    # Header
    writer.writerow([
        "Broj porudžbine", "Datum", "Status", "Kupac", "Telefon",
        "Adresa", "Grad", "Proizvodi", "Ukupno (RSD)", "Način plaćanja"
    ])
    
    for order in orders:
        customer = order.get("customer") or {}
        items_str = "; ".join([
            f"{item['name']} x{item['quantity']}" for item in order.get("items", [])
        ])
        writer.writerow([
            order.get("order_number", ""),
            order.get("created_at", "")[:10],
            order.get("status", ""),
            customer.get("full_name", ""),
            customer.get("phone", ""),
            customer.get("address", ""),
            customer.get("city", ""),
            items_str,
            order.get("total", 0),
            customer.get("payment_method", "")
        ])
    
    text_output.flush()
    text_output.detach()
    output.seek(0)
    
    filename = f"narucify_orders_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@api_router.get("/export/customers/csv")
async def export_customers_csv(user: dict = Depends(get_current_user)):
    """Export all customers as CSV"""
    customers = await db.customers.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(10000)
    
    output = BytesIO()
    output.write(b'\xef\xbb\xbf')
    
    import io
    text_output = io.TextIOWrapper(output, encoding='utf-8', newline='')
    writer = csv.writer(text_output)
    
    writer.writerow(["Ime", "Telefon", "Email", "Adresa", "Grad", "Poštanski broj", "Promo", "Datum"])
    
    for c in customers:
        writer.writerow([
            c.get("full_name", ""),
            c.get("phone", ""),
            c.get("email", ""),
            c.get("address", ""),
            c.get("city", ""),
            c.get("postal_code", ""),
            "Da" if c.get("subscribe_promo") else "Ne",
            c.get("created_at", "")[:10]
        ])
    
    text_output.flush()
    text_output.detach()
    output.seek(0)
    
    filename = f"narucify_customers_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@api_router.get("/export/orders/pdf")
async def export_orders_pdf(user: dict = Depends(get_current_user)):
    """Export all orders as PDF"""
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    orders = await db.orders.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    output = BytesIO()
    doc = SimpleDocTemplate(output, pagesize=landscape(A4), 
                           leftMargin=15*mm, rightMargin=15*mm,
                           topMargin=15*mm, bottomMargin=15*mm)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], 
                                  fontSize=18, spaceAfter=12)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
                                     fontSize=10, textColor=colors.grey, spaceAfter=20)
    cell_style = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=8)
    header_cell_style = ParagraphStyle('HeaderCell', parent=styles['Normal'], 
                                        fontSize=9, textColor=colors.white)
    
    elements = []
    elements.append(Paragraph("Narucify - Izvestaj o porudzbinama", title_style))
    elements.append(Paragraph(
        f"Generisano: {datetime.now().strftime('%d.%m.%Y %H:%M')} | Ukupno: {len(orders)} porudzbina",
        subtitle_style
    ))
    
    # Table data
    header = ["#", "Broj", "Datum", "Status", "Kupac", "Telefon", "Grad", "Proizvodi", "Ukupno (RSD)", "Placanje"]
    data = [[Paragraph(h, header_cell_style) for h in header]]
    
    for i, order in enumerate(orders, 1):
        customer = order.get("customer") or {}
        items = order.get("items", [])
        items_str = "; ".join([f"{it['name']} x{it['quantity']}" for it in items[:3]])
        if len(items) > 3:
            items_str += f" +{len(items)-3}"
        
        row = [
            Paragraph(str(i), cell_style),
            Paragraph(order.get("order_number", ""), cell_style),
            Paragraph(order.get("created_at", "")[:10], cell_style),
            Paragraph(order.get("status", ""), cell_style),
            Paragraph(customer.get("full_name", ""), cell_style),
            Paragraph(customer.get("phone", ""), cell_style),
            Paragraph(customer.get("city", ""), cell_style),
            Paragraph(items_str, cell_style),
            Paragraph(f'{order.get("total", 0):,.0f}', cell_style),
            Paragraph(customer.get("payment_method", ""), cell_style),
        ]
        data.append(row)
    
    col_widths = [25, 65, 60, 55, 80, 75, 60, 150, 65, 65]
    
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF5500')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FAFAFA')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    elements.append(table)
    
    # Summary
    total_revenue = sum(o.get("total", 0) for o in orders)
    confirmed = sum(1 for o in orders if o.get("status") == "confirmed")
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        f"Ukupan prihod: {total_revenue:,.0f} RSD | Potvrdjena: {confirmed} | Na cekanju: {len(orders)-confirmed}",
        subtitle_style
    ))
    
    doc.build(elements)
    output.seek(0)
    
    filename = f"narucify_orders_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==================== NOTIFICATIONS ====================

@api_router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    unread = sum(1 for n in notifications if not n.get("read", False))
    return {"notifications": notifications, "unread_count": unread}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"success": True}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user["id"]},
        {"$set": {"read": True}}
    )
    return {"success": True}


# ==================== IMAGE UPLOAD ====================

class ImageUploadData(BaseModel):
    image: str

@api_router.post("/upload/image")
async def upload_image(data: ImageUploadData, user: dict = Depends(get_current_user)):
    try:
        if len(data.image) > 7_000_000:
            raise HTTPException(status_code=400, detail="Image too large (max 5MB)")
        result = cloudinary.uploader.upload(
            data.image,
            folder=f"narucify/{user['id']}",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit", "quality": "auto"}
            ]
        )
        return {"url": result["secure_url"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")


# ==================== ONBOARDING ====================

class OnboardingComplete(BaseModel):
    shop_name: Optional[str] = None
    shop_description: Optional[str] = None

@api_router.post("/onboarding/complete")
async def complete_onboarding(data: OnboardingComplete, user: dict = Depends(get_current_user)):
    update = {"onboarding_completed": True}
    if data.shop_name:
        update["shop_name"] = data.shop_name[:100]
    if data.shop_description:
        update["shop_description"] = data.shop_description[:500]
    await db.users.update_one({"id": user["id"]}, {"$set": update})
    return {"success": True}

@api_router.post("/onboarding/skip")
async def skip_onboarding(user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"onboarding_completed": True}})
    return {"success": True}


# ==================== COUPONS ====================

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: Optional[float] = 0
    max_uses: Optional[int] = None
    expires_at: Optional[str] = None

class CouponUpdate(BaseModel):
    is_active: Optional[bool] = None

@api_router.post("/coupons")
async def create_coupon(data: CouponCreate, user: dict = Depends(get_current_user)):
    code = data.code.strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    existing = await db.coupons.find_one({"user_id": user["id"], "code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "code": code,
        "discount_type": data.discount_type,
        "discount_value": data.discount_value,
        "min_order_amount": data.min_order_amount or 0,
        "max_uses": data.max_uses,
        "used_count": 0,
        "is_active": True,
        "expires_at": data.expires_at,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.coupons.insert_one(coupon_doc)
    coupon_doc.pop("_id", None)
    return coupon_doc

@api_router.get("/coupons")
async def get_coupons(user: dict = Depends(get_current_user)):
    coupons = await db.coupons.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return coupons

@api_router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, data: CouponUpdate, user: dict = Depends(get_current_user)):
    update = {}
    if data.is_active is not None:
        update["is_active"] = data.is_active
    if update:
        await db.coupons.update_one(
            {"id": coupon_id, "user_id": user["id"]},
            {"$set": update}
        )
    return {"success": True}

@api_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, user: dict = Depends(get_current_user)):
    await db.coupons.delete_one({"id": coupon_id, "user_id": user["id"]})
    return {"success": True}

@api_router.post("/public/shop/{user_id}/validate-coupon")
async def validate_coupon(user_id: str, data: dict):
    code = data.get("code", "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    coupon = await db.coupons.find_one({
        "user_id": user_id,
        "code": code,
        "is_active": True
    })
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if coupon.get("expires_at"):
        try:
            expires = datetime.fromisoformat(coupon["expires_at"].replace("Z", "+00:00"))
            if expires < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Coupon has expired")
        except (ValueError, TypeError):
            pass
    if coupon.get("max_uses") and coupon["used_count"] >= coupon["max_uses"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    return {
        "valid": True,
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        "min_order_amount": coupon.get("min_order_amount", 0)
    }


# ==================== PAYPAL PAYMENTS ====================

@api_router.post("/payments/paypal/create-order")
async def create_paypal_order(user: dict = Depends(get_current_user)):
    try:
        access_token = await get_paypal_access_token()
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json={
                    "intent": "CAPTURE",
                    "purchase_units": [{
                        "amount": {
                            "currency_code": "EUR",
                            "value": "9.99"
                        },
                        "description": "Narucify PRO - 1 mesec"
                    }]
                }
            )
            resp.raise_for_status()
            order_data = resp.json()
            return {"id": order_data["id"], "status": order_data["status"]}
    except Exception as e:
        logger.error(f"PayPal create order error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create PayPal order")

@api_router.post("/payments/paypal/capture/{order_id}")
async def capture_paypal_order(order_id: str, user: dict = Depends(get_current_user)):
    try:
        access_token = await get_paypal_access_token()
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            resp.raise_for_status()
            capture_data = resp.json()
            if capture_data.get("status") == "COMPLETED":
                pro_expires = datetime.now(timezone.utc) + timedelta(days=30)
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {
                        "is_pro": True,
                        "pro_expires_at": pro_expires.isoformat()
                    }}
                )
                await create_notification(
                    user["id"],
                    "PRO aktiviran! 🎉",
                    "Tvoj PRO plan je aktivan narednih 30 dana.",
                    "payment"
                )
                return {"status": "COMPLETED", "pro_expires_at": pro_expires.isoformat()}
            return {"status": capture_data.get("status", "UNKNOWN")}
    except Exception as e:
        logger.error(f"PayPal capture error: {e}")
        raise HTTPException(status_code=500, detail="Failed to capture PayPal payment")

@api_router.get("/payments/paypal/client-id")
async def get_paypal_client_id(user: dict = Depends(get_current_user)):
    return {"client_id": PAYPAL_CLIENT_ID}


app.include_router(api_router)

# ==================== MIDDLEWARE & LOGGING ====================

cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    allow_origins = ['*']
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
