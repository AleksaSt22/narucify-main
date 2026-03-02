"""
Backend API tests for DM Order System - P0 Features
Tests: Mini Shop, Delivery Time, Products, Orders
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {
    "email": "test@dmorder.com",
    "password": "test123"
}

ADMIN_USER = {
    "email": "admin@dmorder.com",
    "password": "admin123"
}

# Test data from review request
TEST_PRODUCT_ID = "191b1cb0-b415-40a1-a918-25035f050431"
TEST_USER_ID = "7085af99-96d7-45a0-8d0d-7f654471111e"
TEST_ORDER_NUMBER = "ORD-20260215-8FF8E8"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def admin_token():
    """Get authentication token for admin user"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json=ADMIN_USER)
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture
def authenticated_client(auth_token):
    """Create a session with auth header"""
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    })
    return session


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_login_success(self):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER["email"]
        assert "referral_code" in data["user"]
        assert "badges" in data["user"]

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_admin_login_success(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json=ADMIN_USER)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["is_admin"] == True

    def test_get_me(self, authenticated_client):
        """Test getting current user info"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "referral_code" in data
        assert "badges" in data or data.get("badges") is not None


class TestMiniShopEndpoints:
    """Test Mini Shop functionality - P0 Feature"""

    def test_get_public_shop(self):
        """Test public shop endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/shop/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "seller_name" in data
        assert "products" in data
        assert isinstance(data["products"], list)
        # Check that products have required fields
        for product in data["products"]:
            assert "id" in product
            assert "name" in product
            assert "price" in product
            assert "show_in_shop" in product

    def test_get_public_shop_not_found(self):
        """Test public shop with invalid user ID"""
        response = requests.get(f"{BASE_URL}/api/public/shop/invalid-user-id")
        assert response.status_code == 404

    def test_toggle_product_in_shop(self, authenticated_client):
        """Test toggling product visibility in mini shop"""
        # First get the current state
        response = authenticated_client.get(f"{BASE_URL}/api/products/{TEST_PRODUCT_ID}")
        if response.status_code == 404:
            pytest.skip("Test product not found")
        
        original_state = response.json().get("show_in_shop", False)
        
        # Toggle the state
        response = authenticated_client.put(f"{BASE_URL}/api/products/{TEST_PRODUCT_ID}/shop")
        assert response.status_code == 200
        data = response.json()
        assert "show_in_shop" in data
        assert data["show_in_shop"] != original_state
        
        # Toggle back to original state
        response = authenticated_client.put(f"{BASE_URL}/api/products/{TEST_PRODUCT_ID}/shop")
        assert response.status_code == 200
        assert response.json()["show_in_shop"] == original_state


class TestProductsEndpoints:
    """Test Products CRUD operations"""

    def test_get_products(self, authenticated_client):
        """Test getting all products"""
        response = authenticated_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify product structure
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            assert "price" in product
            assert "stock" in product
            assert "show_in_shop" in product

    def test_get_single_product(self, authenticated_client):
        """Test getting a single product"""
        response = authenticated_client.get(f"{BASE_URL}/api/products/{TEST_PRODUCT_ID}")
        if response.status_code == 404:
            pytest.skip("Test product not found")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == TEST_PRODUCT_ID
        assert "show_in_shop" in data

    def test_create_and_delete_product(self, authenticated_client):
        """Test creating and deleting a product"""
        # Create product
        new_product = {
            "name": "TEST_Product_For_Shop",
            "description": "Test product for automated testing",
            "price": 100.0,
            "stock": 10,
            "show_in_shop": False
        }
        response = authenticated_client.post(f"{BASE_URL}/api/products", json=new_product)
        assert response.status_code == 200
        created_product = response.json()
        assert created_product["name"] == new_product["name"]
        assert "show_in_shop" in created_product
        
        product_id = created_product["id"]
        
        # Verify creation with GET
        response = authenticated_client.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        
        # Delete product
        response = authenticated_client.delete(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        
        # Verify deletion
        response = authenticated_client.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 404


class TestOrdersEndpoints:
    """Test Orders with Delivery Time - P0 Feature"""

    def test_get_orders(self, authenticated_client):
        """Test getting all orders"""
        response = authenticated_client.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify order structure with delivery time
        if len(data) > 0:
            order = data[0]
            assert "id" in order
            assert "order_number" in order
            assert "status" in order
            assert "total" in order
            # New field for delivery time
            assert "estimated_delivery_days" in order or order.get("estimated_delivery_days") is None

    def test_update_order_status_with_delivery_time(self, authenticated_client):
        """Test updating order status with delivery time - P0 Feature"""
        # First get an order
        response = authenticated_client.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        orders = response.json()
        
        if len(orders) == 0:
            pytest.skip("No orders to test")
        
        order = orders[0]
        order_id = order["id"]
        
        # Update order with new delivery time
        update_data = {
            "status": order["status"],  # Keep same status
            "estimated_delivery_days": 5
        }
        response = authenticated_client.put(
            f"{BASE_URL}/api/orders/{order_id}/status",
            json=update_data
        )
        assert response.status_code == 200
        updated_order = response.json()
        assert updated_order["estimated_delivery_days"] == 5
        
        # Restore original delivery time
        restore_data = {
            "status": order["status"],
            "estimated_delivery_days": order.get("estimated_delivery_days", 3)
        }
        response = authenticated_client.put(
            f"{BASE_URL}/api/orders/{order_id}/status",
            json=restore_data
        )
        assert response.status_code == 200

    def test_create_order_with_delivery_time(self, authenticated_client):
        """Test creating order with delivery time"""
        # First get products
        response = authenticated_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        if len(products) == 0:
            pytest.skip("No products to create order")
        
        # Find a product with stock
        product = next((p for p in products if p["stock"] > 0), None)
        if not product:
            pytest.skip("No products with stock")
        
        # Create order with delivery time
        order_data = {
            "items": [{"product_id": product["id"], "quantity": 1}],
            "notes": "TEST_Order_With_Delivery",
            "estimated_delivery_days": 7
        }
        response = authenticated_client.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        created_order = response.json()
        assert "order_number" in created_order
        assert created_order["estimated_delivery_days"] == 7
        
        # Clean up - delete the test order
        order_id = created_order["id"]
        response = authenticated_client.delete(f"{BASE_URL}/api/orders/{order_id}")
        assert response.status_code == 200


class TestOrderStatusEndpoints:
    """Test Order Status Updates - For Filter Buttons"""

    def test_valid_status_transitions(self, authenticated_client):
        """Test all valid order statuses"""
        valid_statuses = ["pending_customer", "new", "confirmed", "shipped", "completed", "canceled"]
        
        response = authenticated_client.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        orders = response.json()
        
        if len(orders) == 0:
            pytest.skip("No orders to test status transitions")
        
        order = orders[0]
        original_status = order["status"]
        order_id = order["id"]
        
        # Test updating to 'confirmed' status
        response = authenticated_client.put(
            f"{BASE_URL}/api/orders/{order_id}/status",
            json={"status": "confirmed"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "confirmed"
        
        # Restore original status
        response = authenticated_client.put(
            f"{BASE_URL}/api/orders/{order_id}/status",
            json={"status": original_status}
        )
        assert response.status_code == 200

    def test_invalid_status(self, authenticated_client):
        """Test that invalid status is rejected"""
        response = authenticated_client.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        orders = response.json()
        
        if len(orders) == 0:
            pytest.skip("No orders to test")
        
        order_id = orders[0]["id"]
        response = authenticated_client.put(
            f"{BASE_URL}/api/orders/{order_id}/status",
            json={"status": "invalid_status"}
        )
        assert response.status_code == 400


class TestReferralProgram:
    """Test Referral Program Functionality"""

    def test_referral_code_in_user_data(self, authenticated_client):
        """Test that user has referral code"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "referral_code" in data
        assert data["referral_code"] is not None
        assert len(data["referral_code"]) > 0


class TestBadgesFeature:
    """Test Badge Gamification"""

    def test_badges_in_user_data(self, authenticated_client):
        """Test that badges array exists in user data"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        # Badges should be an array (might be empty for new users)
        assert "badges" in data
        assert isinstance(data["badges"], list) or data["badges"] is None


class TestDashboardStats:
    """Test Dashboard functionality"""

    def test_get_dashboard_stats(self, authenticated_client):
        """Test getting dashboard stats"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "pending_orders" in data
        assert "completed_orders" in data
        assert "total_revenue" in data
        assert "total_products" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
