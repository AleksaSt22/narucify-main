import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ShoppingBag, 
  Package, 
  Globe,
  Loader2,
  AlertCircle,
  Plus,
  Crown,
  Minus,
  X,
  ArrowLeft,
  Check,
  MapPin,
  CreditCard,
  ShoppingCart,
  Sparkles,
  ChevronUp,
  Share2,
  MessageCircle,
  Instagram,
  Phone,
  Flame,
  PauseCircle,
  Zap,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ==================== TRANSLATIONS ====================
const translations = {
  en: {
    catalog: 'Catalog',
    products: 'Products',
    addToOrder: 'Add to Cart',
    outOfStock: 'Out of Stock',
    currency: 'RSD',
    loading: 'Loading...',
    shopNotFound: 'Shop not found',
    noProducts: 'No products available yet',
    noProductsDesc: 'Check back soon for new arrivals!',
    poweredBy: 'Powered by Narucify',
    total: 'Total',
    checkout: 'Complete Order',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Delivery Address',
    city: 'City',
    postalCode: 'Postal Code',
    email: 'Email (optional)',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    subscribePromo: 'I want to receive promotions and special offers',
    confirmOrder: 'Confirm Order',
    orderSuccess: 'Order Confirmed!',
    thankYou: "Thank you for your order! We'll get it to you as soon as possible.",
    orderNumber: 'Your order number',
    trackOrder: 'Track Order',
    continueShopping: 'Continue Shopping',
    addedToCart: 'Added to cart!',
    deliveryInfo: 'Delivery Information',
    orderSummary: 'Order Summary',
    browseProducts: 'Browse our collection',
    allProducts: 'All Products',
    items: 'items',
    paymentMethod: 'Payment Method',
    backToShop: 'Back to Catalog',
    lastItems: 'Only {n} left!',
    onSale: 'SALE',
    orderNow: 'Order Now',
    share: 'Share',
    linkCopied: 'Link copied!',
    vacationTitle: 'Shop is on break',
    vacationDefault: 'We are temporarily paused. Come back soon!',
    contactUs: 'Contact us',
    wasPrice: 'was',
  },
  sr: {
    catalog: 'Katalog',
    products: 'Proizvodi',
    addToOrder: 'Dodaj u korpu',
    outOfStock: 'Nema na stanju',
    currency: 'RSD',
    loading: 'Učitavanje...',
    shopNotFound: 'Prodavnica nije pronađena',
    noProducts: 'Još nema proizvoda',
    noProductsDesc: 'Vrati se uskoro po nove proizvode!',
    poweredBy: 'Powered by Narucify',
    total: 'Ukupno',
    checkout: 'Završi porudžbinu',
    fullName: 'Ime i prezime',
    phone: 'Broj telefona',
    address: 'Adresa za dostavu',
    city: 'Grad',
    postalCode: 'Poštanski broj',
    email: 'Email (opciono)',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    subscribePromo: 'Želim da primam promocije i specijalne ponude',
    confirmOrder: 'Potvrdi porudžbinu',
    orderSuccess: 'Porudžbina potvrđena!',
    thankYou: 'Hvala na porudžbini! Isporučujemo ti je što pre.',
    orderNumber: 'Broj tvoje porudžbine',
    trackOrder: 'Prati porudžbinu',
    continueShopping: 'Nastavi kupovinu',
    addedToCart: 'Dodato u korpu!',
    deliveryInfo: 'Podaci za dostavu',
    orderSummary: 'Pregled porudžbine',
    browseProducts: 'Pogledaj našu ponudu',
    allProducts: 'Svi proizvodi',
    items: 'artikala',
    paymentMethod: 'Način plaćanja',
    backToShop: 'Nazad u katalog',
    lastItems: 'Još samo {n}!',
    onSale: 'AKCIJA',
    orderNow: 'Poruči odmah',
    share: 'Podeli',
    linkCopied: 'Link kopiran!',
    vacationTitle: 'Prodavnica je na pauzi',
    vacationDefault: 'Privremeno smo pauzirali. Vrati se uskoro!',
    contactUs: 'Kontaktiraj nas',
    wasPrice: 'bilo',
  }
};

// ==================== THEME SYSTEM ====================
const themes = {
  elegance: {
    name: 'Elegance',
    bg: 'bg-stone-50',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-stone-200',
    cardBg: 'bg-white',
    cardBorder: 'border border-stone-200 hover:border-stone-300',
    cardShadow: 'shadow-sm hover:shadow-lg',
    textPrimary: 'text-stone-900',
    textSecondary: 'text-stone-500',
    textPrice: 'text-stone-900',
    accent: 'bg-stone-900 text-white hover:bg-stone-800',
    accentLight: 'bg-stone-100 text-stone-900',
    badge: 'bg-stone-900 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-600 border border-red-200',
    inputBg: 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-400',
    cartBg: 'bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
    heroBg: 'bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30',
    heroText: 'text-stone-900',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/50',
    checkoutBg: 'bg-stone-50',
    successBg: 'bg-stone-50',
    successCard: 'bg-white border border-stone-200',
    divider: 'border-stone-200',
    btnOutline: 'border-stone-300 text-stone-700 hover:bg-stone-100',
    radioBox: 'bg-stone-50 border border-stone-200',
    watermarkBg: 'bg-white/90 border-t border-stone-200',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-stone-300',
    cartIcon: 'text-stone-900',
    imgPlaceholder: 'bg-stone-100',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-zinc-950',
    headerBg: 'bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800',
    cardBg: 'bg-zinc-900',
    cardBorder: 'border border-zinc-800 hover:border-zinc-700',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-400',
    textPrice: 'text-violet-400',
    accent: 'bg-violet-600 text-white hover:bg-violet-500',
    accentLight: 'bg-violet-500/10 text-violet-400',
    badge: 'bg-violet-600 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-zinc-800 border-zinc-700 text-white focus:border-violet-500',
    cartBg: 'bg-zinc-900 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-zinc-900 via-violet-950/30 to-zinc-900',
    heroText: 'text-white',
    heroSub: 'text-zinc-400',
    sectionBg: 'bg-zinc-900/50',
    checkoutBg: 'bg-zinc-950',
    successBg: 'bg-zinc-950',
    successCard: 'bg-zinc-900 border border-zinc-800',
    divider: 'border-zinc-800',
    btnOutline: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800',
    radioBox: 'bg-zinc-800 border border-zinc-700',
    watermarkBg: 'bg-zinc-900/90 border-t border-zinc-800',
    watermarkText: 'text-zinc-500',
    emptyIcon: 'text-zinc-600',
    cartIcon: 'text-violet-400',
    imgPlaceholder: 'bg-zinc-800',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-orange-50/50',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-orange-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-orange-100 hover:border-orange-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-orange-100/50',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    textPrice: 'text-orange-600',
    accent: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600',
    accentLight: 'bg-orange-50 text-orange-600',
    badge: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-orange-50/50 border-orange-200 text-stone-800 focus:border-orange-400',
    cartBg: 'bg-white border-t border-orange-100 shadow-[0_-4px_20px_rgba(249,115,22,0.08)]',
    heroBg: 'bg-gradient-to-br from-orange-100 via-rose-50 to-amber-50',
    heroText: 'text-stone-800',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-orange-50/30',
    successBg: 'bg-orange-50/30',
    successCard: 'bg-white border border-orange-100',
    divider: 'border-orange-100',
    btnOutline: 'border-orange-200 text-stone-700 hover:bg-orange-50',
    radioBox: 'bg-orange-50/50 border border-orange-200',
    watermarkBg: 'bg-white/90 border-t border-orange-100',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-orange-200',
    cartIcon: 'text-orange-500',
    imgPlaceholder: 'bg-orange-50',
  },
  nature: {
    name: 'Nature',
    bg: 'bg-emerald-50/30',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-emerald-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-emerald-100 hover:border-emerald-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-emerald-100/50',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    textPrice: 'text-emerald-600',
    accent: 'bg-emerald-600 text-white hover:bg-emerald-500',
    accentLight: 'bg-emerald-50 text-emerald-700',
    badge: 'bg-emerald-600 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-emerald-50/30 border-emerald-200 text-stone-800 focus:border-emerald-400',
    cartBg: 'bg-white border-t border-emerald-100 shadow-[0_-4px_20px_rgba(16,185,129,0.08)]',
    heroBg: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-50',
    heroText: 'text-stone-800',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-emerald-50/20',
    successBg: 'bg-emerald-50/20',
    successCard: 'bg-white border border-emerald-100',
    divider: 'border-emerald-100',
    btnOutline: 'border-emerald-200 text-stone-700 hover:bg-emerald-50',
    radioBox: 'bg-emerald-50/50 border border-emerald-200',
    watermarkBg: 'bg-white/90 border-t border-emerald-100',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-emerald-200',
    cartIcon: 'text-emerald-600',
    imgPlaceholder: 'bg-emerald-50',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-slate-900',
    headerBg: 'bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50',
    cardBg: 'bg-slate-800/80',
    cardBorder: 'border border-slate-700/50 hover:border-cyan-500/30',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-cyan-500/10',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textPrice: 'text-cyan-400',
    accent: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500',
    accentLight: 'bg-cyan-500/10 text-cyan-400',
    badge: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-slate-700/50 border-slate-600 text-white focus:border-cyan-500',
    cartBg: 'bg-slate-800 border-t border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-slate-800 via-cyan-950/40 to-blue-950/30',
    heroText: 'text-white',
    heroSub: 'text-slate-400',
    sectionBg: 'bg-slate-800/30',
    checkoutBg: 'bg-slate-900',
    successBg: 'bg-slate-900',
    successCard: 'bg-slate-800 border border-slate-700/50',
    divider: 'border-slate-700/50',
    btnOutline: 'border-slate-600 text-slate-300 hover:bg-slate-700',
    radioBox: 'bg-slate-700/50 border border-slate-600',
    watermarkBg: 'bg-slate-800/90 border-t border-slate-700/50',
    watermarkText: 'text-slate-500',
    emptyIcon: 'text-slate-600',
    cartIcon: 'text-cyan-400',
    imgPlaceholder: 'bg-slate-700',
  },
  minimal: {
    name: 'Minimal',
    bg: 'bg-white',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-neutral-100',
    cardBg: 'bg-white',
    cardBorder: 'border-0',
    cardShadow: 'hover:shadow-md',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-400',
    textPrice: 'text-neutral-900',
    accent: 'bg-neutral-900 text-white hover:bg-neutral-800',
    accentLight: 'bg-neutral-100 text-neutral-900',
    badge: 'bg-neutral-900 text-white',
    badgeOutOfStock: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
    inputBg: 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400',
    cartBg: 'bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]',
    heroBg: 'bg-neutral-50',
    heroText: 'text-neutral-900',
    heroSub: 'text-neutral-400',
    sectionBg: 'bg-neutral-50/50',
    checkoutBg: 'bg-white',
    successBg: 'bg-white',
    successCard: 'bg-neutral-50 border border-neutral-100',
    divider: 'border-neutral-100',
    btnOutline: 'border-neutral-200 text-neutral-700 hover:bg-neutral-50',
    radioBox: 'bg-neutral-50 border border-neutral-200',
    watermarkBg: 'bg-white/90 border-t border-neutral-100',
    watermarkText: 'text-neutral-300',
    emptyIcon: 'text-neutral-200',
    cartIcon: 'text-neutral-900',
    imgPlaceholder: 'bg-neutral-50',
  }
};

// Export themes for use in SettingsPage
export { themes };

// ==================== COMPONENT ====================
export default function MiniShopPage() {
  const { shopId } = useParams();
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dm-order-public-lang');
    return saved || 'sr';
  });
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    email: '',
    payment_method: 'cash_on_delivery',
    subscribe_promo: false
  });

  const t = (key) => translations[language]?.[key] || key;
  const theme = themes[shop?.shop_theme] || themes.elegance;

  useEffect(() => {
    localStorage.setItem('dm-order-public-lang', language);
  }, [language]);

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const fetchShop = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/shop/${shopId}`);
      setShop(response.data);
    } catch (err) {
      console.error('Error fetching shop:', err);
      setError('shopNotFound');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
    toast.success(t('addedToCart'));
  };

  const updateQuantity = (productId, delta) => {
    const product = shop.products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, Math.min(product?.stock || 99, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (couponDiscount) {
      if (couponDiscount.discount_type === 'percent') {
        return Math.max(0, subtotal - subtotal * (couponDiscount.discount_value / 100));
      } else {
        return Math.max(0, subtotal - couponDiscount.discount_value);
      }
    }
    return subtotal;
  };
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address || !formData.city) {
      toast.error(language === 'sr' ? 'Popuni sva obavezna polja' : 'Fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const orderResponse = await axios.post(`${API_URL}/public/shop/${shopId}/order`, {
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
        customer: formData,
        coupon_code: couponDiscount ? couponCode : null
      });
      setOrderSuccess(orderResponse.data);
      setCart([]);
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(err.response?.data?.detail || (language === 'sr' ? 'Greška pri kreiranju porudžbine' : 'Error creating order'));
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header skeleton */}
        <div className="bg-white border-b border-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-36 bg-stone-200 rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-stone-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Products skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-4 w-24 bg-stone-200 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border border-stone-100 overflow-hidden shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="aspect-square bg-stone-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom text */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 text-stone-300 text-xs">
            <div className="w-3 h-3 rounded-full border border-stone-200 border-t-stone-400 animate-spin" />
            {t('loading')}
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{t(error)}</h1>
        </div>
      </div>
    );
  }

  const showWatermark = !shop?.is_pro;

  // Share product link helper
  const shareProduct = (product) => {
    const url = `${window.location.origin}/shop/${shopId}?p=${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `${product.name} - ${formatCurrency(product.price)}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t('linkCopied'));
    }
  };

  // Quick order — skip cart, go directly to checkout with 1 item
  const quickOrder = (product) => {
    setCart([{ ...product, quantity: 1 }]);
    setShowCheckout(true);
  };

  // ==================== VACATION MODE ====================
  if (shop?.shop_vacation_mode) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.successCard} rounded-2xl p-8 text-center`}>
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <PauseCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>{t('vacationTitle')}</h1>
          <p className={`${theme.textSecondary} mb-6`}>
            {shop.shop_vacation_message || t('vacationDefault')}
          </p>
          {/* Contact buttons even in vacation */}
          {(shop.shop_instagram || shop.shop_whatsapp || shop.shop_viber) && (
            <div className="flex justify-center gap-3">
              {shop.shop_instagram && (
                <a href={`https://instagram.com/${shop.shop_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {shop.shop_whatsapp && (
                <a href={`https://wa.me/${shop.shop_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
              {shop.shop_viber && (
                <a href={`viber://chat?number=${shop.shop_viber.replace(/[^0-9]/g,'')}`}
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
          {showWatermark && (
            <p className={`text-xs ${theme.watermarkText} mt-8`}>{t('poweredBy')}</p>
          )}
        </div>
      </div>
    );
  }

  // ==================== ORDER SUCCESS ====================
  if (orderSuccess) {
    return (
      <div className={`min-h-screen ${theme.successBg} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.successCard} rounded-2xl p-8 text-center`}>
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce-in">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>{t('orderSuccess')}</h1>
          <p className={`${theme.textSecondary} mb-6`}>{t('thankYou')}</p>
          <div className={`p-5 rounded-xl ${theme.sectionBg} border ${theme.divider} mb-6`}>
            <p className={`text-sm ${theme.textSecondary} mb-1`}>{t('orderNumber')}</p>
            <p className={`text-2xl font-bold ${theme.textPrimary} font-mono tracking-wider`}>
              {orderSuccess.order_number}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className={`flex-1 h-12 rounded-xl ${theme.btnOutline}`}
              onClick={() => { setOrderSuccess(null); setShowCheckout(false); }}
            >
              {t('continueShopping')}
            </Button>
            <Button 
              className={`flex-1 h-12 rounded-xl ${theme.accent}`}
              onClick={() => window.location.href = `/track/${orderSuccess.tracking_id}`}
            >
              {t('trackOrder')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== CHECKOUT ====================
  if (showCheckout && cart.length > 0) {
    return (
      <div className={`min-h-screen ${theme.checkoutBg}`} data-testid="checkout-page">
        <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-4`}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button 
              variant="ghost" size="icon"
              onClick={() => setShowCheckout(false)}
              className={`${theme.textSecondary} rounded-full`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className={`font-bold ${theme.textPrimary}`}>{t('backToShop')}</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 pb-8">
          <form onSubmit={handleSubmitOrder} className="space-y-5">

            {/* Order Summary */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <ShoppingCart className="w-4 h-4" />
                  {t('orderSummary')}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl overflow-hidden ${theme.imgPlaceholder} flex-shrink-0`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className={`w-6 h-6 ${theme.emptyIcon}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${theme.textPrimary} truncate`}>{item.name}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className={`font-semibold ${theme.textPrice}`}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className={`pt-4 border-t ${theme.divider} space-y-2`}>
                  {couponDiscount && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme.textSecondary}`}>{language === 'sr' ? 'Međuzbir' : 'Subtotal'}</span>
                        <span className={`text-sm ${theme.textSecondary}`}>{formatCurrency(getSubtotal())}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm">{language === 'sr' ? 'Popust' : 'Discount'} ({couponCode})</span>
                        <span className="text-sm">-{formatCurrency(getSubtotal() - getTotal())}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme.textPrimary}`}>{t('total')}</span>
                    <span className={`text-2xl font-bold ${theme.textPrice}`}>{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <MapPin className="w-4 h-4" />
                  {t('deliveryInfo')}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('fullName')} *</Label>
                  <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('phone')} *</Label>
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('address')} *</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={`text-sm ${theme.textSecondary}`}>{t('city')} *</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={`text-sm ${theme.textSecondary}`}>{t('postalCode')}</Label>
                    <Input value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('email')}</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <CreditCard className="w-4 h-4" />
                  {t('paymentMethod')}
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${theme.radioBox} ${formData.payment_method === 'cash_on_delivery' ? 'ring-2 ring-offset-1 ring-black/10' : ''}`}>
                  <input type="radio" name="payment" value="cash_on_delivery" checked={formData.payment_method === 'cash_on_delivery'} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="accent-neutral-900" />
                  <span className={theme.textPrimary}>{t('cashOnDelivery')}</span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${theme.radioBox} ${formData.payment_method === 'bank_transfer' ? 'ring-2 ring-offset-1 ring-black/10' : ''}`}>
                  <input type="radio" name="payment" value="bank_transfer" checked={formData.payment_method === 'bank_transfer'} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="accent-neutral-900" />
                  <span className={theme.textPrimary}>{t('bankTransfer')}</span>
                </label>
                <label className="flex items-center gap-3 pt-3 cursor-pointer">
                  <Checkbox checked={formData.subscribe_promo} onCheckedChange={checked => setFormData({...formData, subscribe_promo: checked})} />
                  <span className={`text-sm ${theme.textSecondary}`}>{t('subscribePromo')}</span>
                </label>
              </div>
            </div>

            {/* Coupon Code */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className="p-5">
                <p className={`text-sm font-medium ${theme.textPrimary} mb-3`}>
                  {language === 'sr' ? '🏷️ Kupon kod' : '🏷️ Coupon code'}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(null); }}
                    placeholder={language === 'sr' ? 'Unesi kod' : 'Enter code'}
                    className={`${theme.inputBg} h-11 rounded-xl uppercase`}
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 rounded-xl"
                    disabled={!couponCode || validatingCoupon}
                    onClick={async () => {
                      setValidatingCoupon(true);
                      try {
                        const res = await axios.post(`${API_URL}/public/shop/${shopId}/validate-coupon?code=${encodeURIComponent(couponCode)}`);
                        if (res.data.valid) {
                          setCouponDiscount(res.data);
                          toast.success(language === 'sr' ? 'Kupon primenjen!' : 'Coupon applied!');
                        }
                      } catch (err) {
                        setCouponDiscount(null);
                        toast.error(err.response?.data?.detail || (language === 'sr' ? 'Nevažeći kupon' : 'Invalid coupon'));
                      } finally {
                        setValidatingCoupon(false);
                      }
                    }}
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'sr' ? 'Primeni' : 'Apply')}
                  </Button>
                </div>
                {couponDiscount && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center justify-between">
                    <span>
                      {couponDiscount.discount_type === 'percent'
                        ? `${couponDiscount.discount_value}% ${language === 'sr' ? 'popusta' : 'off'}`
                        : `${formatCurrency(couponDiscount.discount_value)} ${language === 'sr' ? 'popusta' : 'off'}`}
                    </span>
                    <span className="font-semibold">
                      -{formatCurrency(getSubtotal() - getTotal())}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className={`w-full h-14 text-lg rounded-xl ${theme.accent} font-semibold`} disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Check className="w-5 h-5 mr-2" />{t('confirmOrder')} — {formatCurrency(getTotal())}</>
              )}
            </Button>
          </form>
        </main>

        {showWatermark && (
          <div className={`${theme.watermarkBg} py-2 text-center`}>
            <a href="/" className={`text-xs ${theme.watermarkText} hover:opacity-70 transition-opacity`}>{t('poweredBy')}</a>
          </div>
        )}
      </div>
    );
  }

  // ==================== MAIN CATALOG ====================
  return (
    <div className={`min-h-screen ${theme.bg}`} data-testid="mini-shop-page">

      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-3`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt={shop.seller_name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-black/5" />
            ) : (
              <div className={`w-10 h-10 rounded-xl ${theme.accent} flex items-center justify-center`}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                {shop?.seller_name}
                {shop?.is_pro && <Crown className="w-4 h-4 text-amber-500" />}
              </h1>
              <p className={`text-xs ${theme.textSecondary}`}>{t('catalog')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary} rounded-full`}>
                <ShoppingCart className="w-5 h-5" />
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>
                  {getItemCount()}
                </span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary} rounded-full`}>
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className={`${theme.heroBg} px-4 py-12 md:py-16`}>
        <div className="max-w-5xl mx-auto text-center">
          {shop?.shop_banner_url && (
            <div className="mb-6 rounded-2xl overflow-hidden max-h-48 md:max-h-64">
              <img src={shop.shop_banner_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.heroText} mb-3`}>
            {shop?.seller_name}
          </h2>
          <p className={`${theme.heroSub} max-w-lg mx-auto text-base md:text-lg`}>
            {shop?.shop_description || t('browseProducts')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${theme.accentLight}`}>
              <Package className="w-4 h-4" />
              {shop?.products?.length || 0} {t('products').toLowerCase()}
            </span>
            {/* Contact buttons */}
            {shop?.shop_instagram && (
              <a href={`https://instagram.com/${shop.shop_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`}>
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {shop?.shop_whatsapp && (
              <a href={`https://wa.me/${shop.shop_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {shop?.shop_viber && (
              <a href={`viber://chat?number=${shop.shop_viber.replace(/[^0-9]/g,'')}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`}>
                <Phone className="w-4 h-4" /> Viber
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>{t('allProducts')}</h3>
        </div>

        {shop?.products?.length === 0 ? (
          <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} ${theme.cardShadow}`}>
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`w-24 h-24 rounded-full ${theme.imgPlaceholder} flex items-center justify-center mb-6`}>
                <Package className={`w-12 h-12 ${theme.emptyIcon}`} />
              </div>
              <p className={`text-xl font-medium ${theme.textPrimary} mb-2`}>{t('noProducts')}</p>
              <p className={theme.textSecondary}>{t('noProductsDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {shop?.products?.map((product, index) => {
              const inCart = cart.find(item => item.id === product.id);
              const justAdded = addedProductId === product.id;
              return (
                <div
                  key={product.id}
                  className={`group rounded-2xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow} transition-all duration-300`}
                  style={{ animationDelay: `${index * 0.05}s`, animation: 'catalogFadeIn 0.4s ease-out forwards', opacity: 0 }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full ${theme.imgPlaceholder} flex items-center justify-center`}>
                        <Package className={`w-12 h-12 ${theme.emptyIcon}`} />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme.badgeOutOfStock}`}>{t('outOfStock')}</span>
                      </div>
                    )}
                    {/* Sale badge */}
                    {product.old_price && product.old_price > product.price && product.stock > 0 && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {t('onSale')}
                      </div>
                    )}
                    {/* Low stock badge */}
                    {shop?.shop_show_low_stock && product.stock > 0 && product.stock <= 3 && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-lg">
                        {t('lastItems').replace('{n}', product.stock)}
                      </div>
                    )}
                    {inCart && (
                      <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full ${theme.badge} flex items-center justify-center text-xs font-bold shadow-lg`}>
                        {inCart.quantity}
                      </div>
                    )}
                    {/* Share button */}
                    {shop?.shop_show_share && !inCart && product.stock > 0 && (
                      <button onClick={() => shareProduct(product)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {justAdded && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-ping-once">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5">
                    <h3 className={`font-medium ${theme.textPrimary} text-sm leading-tight mb-1.5 line-clamp-2`} title={product.name}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className={`text-xs ${theme.textSecondary} line-clamp-2 mb-2`}>{product.description}</p>
                    )}
                    {/* Price with sale support */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className={`text-lg font-bold ${product.old_price && product.old_price > product.price ? 'text-red-500' : theme.textPrice}`}>
                        {formatCurrency(product.price)}
                      </p>
                      {product.old_price && product.old_price > product.price && (
                        <p className={`text-xs ${theme.textSecondary} line-through`}>{formatCurrency(product.old_price)}</p>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {inCart ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" className={`h-9 w-9 p-0 rounded-lg ${theme.btnOutline}`}
                            onClick={() => { inCart.quantity <= 1 ? removeFromCart(product.id) : updateQuantity(product.id, -1); }}>
                            {inCart.quantity <= 1 ? <X className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          </Button>
                          <span className={`flex-1 text-center ${theme.textPrimary} font-semibold text-sm`}>{inCart.quantity}</span>
                          <Button size="sm" variant="outline" className={`h-9 w-9 p-0 rounded-lg ${theme.btnOutline}`}
                            onClick={() => updateQuantity(product.id, 1)} disabled={inCart.quantity >= product.stock}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button className={`w-full rounded-lg h-9 text-sm ${theme.accent} gap-1.5`} size="sm" disabled={product.stock <= 0} onClick={() => addToCart(product)}>
                            <Plus className="w-3.5 h-3.5" />
                            {t('addToOrder')}
                          </Button>
                          {/* Quick order button */}
                          {shop?.shop_quick_order && product.stock > 0 && (
                            <Button variant="outline" className={`w-full rounded-lg h-8 text-xs ${theme.btnOutline} gap-1`} size="sm" onClick={() => quickOrder(product)}>
                              <Zap className="w-3 h-3" />
                              {t('orderNow')}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 ${theme.cartBg}`}>
          {cartOpen && (
            <div className={`border-b ${theme.divider} max-h-64 overflow-y-auto`}>
              <div className="max-w-5xl mx-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg overflow-hidden ${theme.imgPlaceholder} flex-shrink-0`}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center"><Package className={`w-4 h-4 ${theme.emptyIcon}`} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${theme.textPrimary} truncate`}>{item.name}</p>
                      <p className={`text-xs ${theme.textSecondary}`}>{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className={`font-semibold text-sm ${theme.textPrice}`}>{formatCurrency(item.price * item.quantity)}</p>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 rounded-full" onClick={() => removeFromCart(item.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => setCartOpen(!cartOpen)} className="flex items-center gap-3 cursor-pointer bg-transparent border-0">
              <div className="relative">
                <ShoppingCart className={`w-6 h-6 ${theme.cartIcon}`} />
                <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>
                  {getItemCount()}
                </span>
              </div>
              <div className="text-left">
                <p className={`text-sm ${theme.textSecondary}`}>{getItemCount()} {t('items')}</p>
                <p className={`text-lg font-bold ${theme.textPrimary}`}>{formatCurrency(getTotal())}</p>
              </div>
              <ChevronUp className={`w-4 h-4 ${theme.textSecondary} transition-transform ${cartOpen ? 'rotate-180' : ''}`} />
            </button>
            <Button className={`${theme.accent} px-8 h-12 rounded-xl text-base font-semibold`} onClick={() => setShowCheckout(true)}>
              {t('checkout')}
            </Button>
          </div>
        </div>
      )}

      {/* Powered by Narucify - always shown */}
      {cart.length === 0 && (
        <div className={`fixed bottom-0 left-0 right-0 ${theme.watermarkBg} py-2.5 text-center`}>
          <a href="/" className={`text-xs ${theme.watermarkText} hover:opacity-70 transition-opacity`}>{t('poweredBy')}</a>
        </div>
      )}

      <style>{`
        @keyframes catalogFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
        @keyframes pingOnce {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-once { animation: pingOnce 0.6s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
