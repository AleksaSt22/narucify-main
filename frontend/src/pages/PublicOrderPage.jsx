import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Package, Globe, AlertCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const translations = {
  en: {
    orderSummary: 'Order Summary',
    yourDetails: 'Your Details',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    emailOptional: 'Email (optional)',
    subscribePromo: 'I want to receive promotions',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    confirmOrder: 'Confirm Order',
    orderConfirmed: 'Order Confirmed!',
    thankYou: 'Thank you for your order',
    orderNumberIs: 'Your order number is',
    weWillContact: 'We will contact you shortly',
    total: 'Total',
    currency: 'RSD',
    items: 'items',
    item: 'item',
    loading: 'Loading...',
    orderNotFound: 'Order not found',
    orderAlreadyConfirmed: 'This order has already been confirmed',
    error: 'Error',
    from: 'from',
    quantity: 'Qty'
  },
  sr: {
    orderSummary: 'Pregled porudžbine',
    yourDetails: 'Tvoji podaci',
    fullName: 'Ime i prezime',
    phone: 'Broj telefona',
    address: 'Adresa',
    city: 'Grad',
    postalCode: 'Poštanski broj',
    emailOptional: 'Email (opciono)',
    subscribePromo: 'Želim da primam promocije',
    paymentMethod: 'Način plaćanja',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    confirmOrder: 'Potvrdi porudžbinu',
    orderConfirmed: 'Porudžbina potvrđena!',
    thankYou: 'Hvala na porudžbini',
    orderNumberIs: 'Broj tvoje porudžbine je',
    weWillContact: 'Uskoro ćemo te kontaktirati',
    total: 'Ukupno',
    currency: 'RSD',
    items: 'artikala',
    item: 'artikal',
    loading: 'Učitavanje...',
    orderNotFound: 'Porudžbina nije pronađena',
    orderAlreadyConfirmed: 'Ova porudžbina je već potvrđena',
    error: 'Greška',
    from: 'od',
    quantity: 'Kol'
  }
};

export default function PublicOrderPage() {
  const { linkToken } = useParams();
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dm-order-public-lang');
    return saved || 'sr';
  });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    email: '',
    subscribe_promo: false,
    payment_method: 'cash_on_delivery'
  });

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem('dm-order-public-lang', language);
  }, [language]);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkToken]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/order/${linkToken}`);
      if (response.data.status !== 'pending_customer') {
        setError('orderAlreadyConfirmed');
      } else {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('orderNotFound');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/public/order/${linkToken}/confirm`, formData);
      setConfirmed(true);
      setConfirmedOrderNumber(response.data.order_number);
      setTrackingId(response.data.tracking_id);
    } catch (err) {
      console.error('Error confirming order:', err);
      toast.error(err.response?.data?.detail || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">{t(error)}</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (confirmed) {
    const trackingUrl = `${window.location.origin}/track/${trackingId}`;
    
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-fade-in bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white mb-2">
              {t('orderConfirmed')}
            </h1>
            <p className="text-zinc-400 mb-4">{t('thankYou')}</p>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="text-sm text-zinc-400 mb-1">{t('orderNumberIs')}</p>
              <p className="text-xl font-bold font-mono text-primary">{confirmedOrderNumber}</p>
            </div>
            
            {/* Tracking Link */}
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 mb-4">
              <p className="text-sm text-zinc-400 mb-2">
                {language === 'sr' ? 'Link za praćenje porudžbine:' : 'Order tracking link:'}
              </p>
              <div className="flex gap-2">
                <input 
                  value={trackingUrl}
                  readOnly
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white font-mono"
                />
                <Button
                  size="sm"
                  className="primary-gradient"
                  onClick={() => {
                    navigator.clipboard.writeText(trackingUrl);
                    toast.success(language === 'sr' ? 'Link kopiran!' : 'Link copied!');
                  }}
                >
                  {language === 'sr' ? 'Kopiraj' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {language === 'sr' 
                  ? 'Sačuvaj ovaj link da bi pratio status porudžbine' 
                  : 'Save this link to track your order status'}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => window.location.href = trackingUrl}
            >
              {language === 'sr' ? 'Pogledaj status porudžbine' : 'View order status'}
            </Button>
            
            <p className="text-sm text-zinc-500 mt-4">{t('weWillContact')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order Form
  return (
    <div className="min-h-screen bg-zinc-950" data-testid="public-order-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm font-heading">D</span>
            </div>
            <div>
              <p className="font-medium text-white text-sm">{order?.seller_name}</p>
              <p className="text-xs text-zinc-400">Narucify</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')}
            className="gap-2 text-zinc-400 hover:text-white"
            data-testid="public-lang-toggle"
          >
            <Globe className="w-4 h-4" />
            {language.toUpperCase()}
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-32 animate-fade-in">
        {/* Order Summary */}
        <section className="mb-6">
          <h1 className="text-xl font-bold font-heading text-white mb-4">{t('orderSummary')}</h1>
          <div className="space-y-3">
            {order?.items.map((item, idx) => (
              <Card key={idx} className="overflow-hidden bg-zinc-900 border-zinc-800">
                <CardContent className="p-3 flex items-center gap-3">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Package className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.name}</p>
                    <p className="text-sm text-zinc-400">
                      {t('quantity')}: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-white">{formatCurrency(item.subtotal)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customer Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-lg font-bold font-heading text-white mb-4">{t('yourDetails')}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-zinc-300">{t('fullName')} *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white"
                  data-testid="customer-name-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">{t('phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white"
                  data-testid="customer-phone-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-zinc-300">{t('address')} *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white"
                  data-testid="customer-address-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-zinc-300">{t('city')} *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="bg-zinc-900 border-zinc-700 text-white"
                    data-testid="customer-city-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code" className="text-zinc-300">{t('postalCode')}</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    data-testid="customer-postal-input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">{t('emailOptional')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  data-testid="customer-email-input"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribe"
                  checked={formData.subscribe_promo}
                  onCheckedChange={(checked) => setFormData({ ...formData, subscribe_promo: checked })}
                  data-testid="subscribe-checkbox"
                />
                <Label htmlFor="subscribe" className="text-sm text-zinc-400 cursor-pointer">
                  {t('subscribePromo')}
                </Label>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-lg font-bold font-heading text-white mb-4">{t('paymentMethod')}</h2>
            <RadioGroup 
              value={formData.payment_method} 
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-700 hover:border-primary/50 transition-colors cursor-pointer bg-zinc-900">
                <RadioGroupItem value="cash_on_delivery" id="cod" data-testid="payment-cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer text-white">{t('cashOnDelivery')}</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-700 hover:border-primary/50 transition-colors cursor-pointer bg-zinc-900">
                <RadioGroupItem value="bank_transfer" id="bank" data-testid="payment-bank" />
                <Label htmlFor="bank" className="flex-1 cursor-pointer text-white">{t('bankTransfer')}</Label>
              </div>
            </RadioGroup>
          </section>
        </form>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400">{t('total')}</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(order?.total || 0)}</span>
          </div>
          <Button 
            onClick={handleSubmit}
            className="w-full h-12 primary-gradient hover:opacity-90 text-lg font-medium"
            disabled={submitting || !formData.full_name || !formData.phone || !formData.address || !formData.city}
            data-testid="confirm-order-btn"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
            {t('confirmOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
}
