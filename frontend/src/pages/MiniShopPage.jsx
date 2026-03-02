import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Phone,
  User,
  Mail,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const translations = {
  en: {
    shop: 'Shop',
    products: 'Products',
    addToOrder: 'Order',
    outOfStock: 'Out of Stock',
    currency: 'RSD',
    loading: 'Loading...',
    shopNotFound: 'Shop not found',
    noProducts: 'No products available',
    poweredBy: 'Powered by Narucify',
    cart: 'Your Order',
    emptyCart: 'Your cart is empty',
    total: 'Total',
    checkout: 'Complete Order',
    yourDetails: 'Your Details',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    email: 'Email (optional)',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    subscribePromo: 'I want to receive promotions',
    confirmOrder: 'Confirm Order',
    backToShop: 'Back to Shop',
    orderSuccess: 'Order Confirmed!',
    thankYou: 'Thank you for your order',
    orderNumber: 'Your order number',
    trackOrder: 'Track Order',
    quantity: 'Qty',
    remove: 'Remove',
    continueShopping: 'Continue Shopping',
    required: 'Required'
  },
  sr: {
    shop: 'Prodavnica',
    products: 'Proizvodi',
    addToOrder: 'Poruči',
    outOfStock: 'Nema na stanju',
    currency: 'RSD',
    loading: 'Učitavanje...',
    shopNotFound: 'Prodavnica nije pronađena',
    noProducts: 'Nema dostupnih proizvoda',
    poweredBy: 'Powered by Narucify',
    cart: 'Tvoja porudžbina',
    emptyCart: 'Korpa je prazna',
    total: 'Ukupno',
    checkout: 'Završi porudžbinu',
    yourDetails: 'Tvoji podaci',
    fullName: 'Ime i prezime',
    phone: 'Broj telefona',
    address: 'Adresa',
    city: 'Grad',
    postalCode: 'Poštanski broj',
    email: 'Email (opciono)',
    paymentMethod: 'Način plaćanja',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    subscribePromo: 'Želim da primam promocije',
    confirmOrder: 'Potvrdi porudžbinu',
    backToShop: 'Nazad u prodavnicu',
    orderSuccess: 'Porudžbina potvrđena!',
    thankYou: 'Hvala na porudžbini',
    orderNumber: 'Broj tvoje porudžbine',
    trackOrder: 'Prati porudžbinu',
    quantity: 'Kom',
    remove: 'Ukloni',
    continueShopping: 'Nastavi kupovinu',
    required: 'Obavezno'
  }
};

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

  const t = (key) => translations[language][key] || key;

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
    toast.success(language === 'sr' ? 'Dodato u korpu' : 'Added to cart');
  };

  const updateQuantity = (productId, delta) => {
    const product = shop.products.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, Math.min(product?.stock || 99, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.address || !formData.city) {
      toast.error(language === 'sr' ? 'Popuni sva obavezna polja' : 'Fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // First create the order via public shop endpoint
      const orderResponse = await axios.post(`${API_URL}/public/shop/${shopId}/order`, {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer: formData
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-zinc-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">{t(error)}</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order Success View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('orderSuccess')}</h1>
            <p className="text-zinc-400 mb-4">{t('thankYou')}</p>
            <div className="p-4 rounded-lg bg-zinc-800 mb-6">
              <p className="text-sm text-zinc-400">{t('orderNumber')}</p>
              <p className="text-xl font-bold text-primary font-mono">{orderSuccess.order_number}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 border-zinc-700"
                onClick={() => {
                  setOrderSuccess(null);
                  setShowCheckout(false);
                }}
              >
                {t('continueShopping')}
              </Button>
              <Button 
                className="flex-1 primary-gradient"
                onClick={() => window.location.href = `/track/${orderSuccess.tracking_id}`}
              >
                {t('trackOrder')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showWatermark = !shop?.is_pro;

  // Checkout View
  if (showCheckout && cart.length > 0) {
    return (
      <div className="min-h-screen bg-zinc-950" data-testid="checkout-page">
        <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowCheckout(false)}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-white">{t('checkout')}</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 pb-24">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <h2 className="font-semibold text-white mb-4">{t('cart')}</h2>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center">
                          <Package className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.name}</p>
                        <p className="text-sm text-zinc-400">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="font-semibold text-white">{t('total')}</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(getTotal())}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('yourDetails')}
                </h2>
                
                <div className="space-y-2">
                  <Label className="text-zinc-400">{t('fullName')} *</Label>
                  <Input 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">{t('phone')} *</Label>
                  <Input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">{t('address')} *</Label>
                  <Input 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">{t('city')} *</Label>
                    <Input 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">{t('postalCode')}</Label>
                    <Input 
                      value={formData.postal_code}
                      onChange={e => setFormData({...formData, postal_code: e.target.value})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">{t('email')}</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('paymentMethod')}
                </h2>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cash_on_delivery"
                      checked={formData.payment_method === 'cash_on_delivery'}
                      onChange={e => setFormData({...formData, payment_method: e.target.value})}
                      className="text-primary"
                    />
                    <span className="text-white">{t('cashOnDelivery')}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={e => setFormData({...formData, payment_method: e.target.value})}
                      className="text-primary"
                    />
                    <span className="text-white">{t('bankTransfer')}</span>
                  </label>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={formData.subscribe_promo}
                    onCheckedChange={checked => setFormData({...formData, subscribe_promo: checked})}
                  />
                  <span className="text-sm text-zinc-400">{t('subscribePromo')}</span>
                </label>
              </CardContent>
            </Card>

            <Button 
              type="submit"
              className="w-full primary-gradient h-12 text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {t('confirmOrder')}
                </>
              )}
            </Button>
          </form>
        </main>

        {showWatermark && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur border-t border-zinc-800 py-2 text-center">
            <span className="text-xs text-zinc-500">{t('poweredBy')}</span>
          </div>
        )}
      </div>
    );
  }

  // Main Shop View
  return (
    <div className="min-h-screen bg-zinc-950" data-testid="mini-shop-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt={shop.seller_name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-white flex items-center gap-2">
                {shop?.seller_name}
                {shop?.is_pro && (
                  <Crown className="w-4 h-4 text-amber-500" />
                )}
              </h1>
              <p className="text-xs text-zinc-400">{t('shop')}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')}
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <Globe className="w-4 h-4" />
            {language.toUpperCase()}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-32">
        {/* Products Grid */}
        {shop?.products?.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-zinc-600 mb-4" />
              <p className="text-xl font-medium text-white mb-2">{t('noProducts')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shop?.products?.map((product, index) => {
              const inCart = cart.find(item => item.id === product.id);
              return (
                <Card 
                  key={product.id}
                  className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive">{t('outOfStock')}</Badge>
                      </div>
                    )}
                    {inCart && (
                      <Badge className="absolute top-2 right-2 bg-primary border-0">
                        {inCart.quantity}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-white truncate text-sm" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(product.price)}
                    </p>
                    {inCart ? (
                      <div className="flex items-center gap-2 mt-3">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 border-zinc-700"
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="flex-1 text-center text-white font-medium">{inCart.quantity}</span>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 border-zinc-700"
                          onClick={() => updateQuantity(product.id, 1)}
                          disabled={inCart.quantity >= product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 text-red-400 hover:text-red-300"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-3 primary-gradient hover:opacity-90 gap-2"
                        size="sm"
                        disabled={product.stock <= 0}
                        onClick={() => addToCart(product)}
                      >
                        <Plus className="w-4 h-4" />
                        {t('addToOrder')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">{cart.reduce((sum, item) => sum + item.quantity, 0)} {language === 'sr' ? 'artikala' : 'items'}</p>
              <p className="text-xl font-bold text-white">{formatCurrency(getTotal())}</p>
            </div>
            <Button 
              className="primary-gradient px-8"
              onClick={() => setShowCheckout(true)}
            >
              {t('checkout')}
            </Button>
          </div>
        </div>
      )}

      {/* Watermark - Only show if not PRO and no cart */}
      {showWatermark && cart.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur border-t border-zinc-800 py-2 text-center">
          <a 
            href="/" 
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {t('poweredBy')}
          </a>
        </div>
      )}
    </div>
  );
}
