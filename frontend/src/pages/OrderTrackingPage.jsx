import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Globe,
  XCircle,
  Loader2,
  AlertCircle,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const translations = {
  en: {
    trackOrder: 'Track Order',
    orderNumber: 'Order Number',
    status: 'Status',
    items: 'Items',
    total: 'Total',
    deliveryAddress: 'Delivery Address',
    contact: 'Contact',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    orderPlaced: 'Order Placed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    canceled: 'Canceled',
    loading: 'Loading...',
    orderNotFound: 'Order not found',
    copyLink: 'Copy tracking link',
    linkCopied: 'Link copied!',
    currency: 'RSD',
    pending_customer: 'Awaiting Confirmation',
    new: 'New Order',
    confirmed: 'Confirmed',
    completed: 'Delivered',
    thankYou: 'Thank you for your order!',
    estimatedDelivery: 'Estimated delivery: 2-5 business days'
  },
  sr: {
    trackOrder: 'Praćenje Porudžbine',
    orderNumber: 'Broj Porudžbine',
    status: 'Status',
    items: 'Proizvodi',
    total: 'Ukupno',
    deliveryAddress: 'Adresa Dostave',
    contact: 'Kontakt',
    paymentMethod: 'Način Plaćanja',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    orderPlaced: 'Porudžbina Primljena',
    processing: 'U obradi',
    shipped: 'Poslato',
    delivered: 'Isporučeno',
    canceled: 'Otkazano',
    loading: 'Učitavanje...',
    orderNotFound: 'Porudžbina nije pronađena',
    copyLink: 'Kopiraj link za praćenje',
    linkCopied: 'Link kopiran!',
    currency: 'RSD',
    pending_customer: 'Čeka potvrdu',
    new: 'Nova porudžbina',
    confirmed: 'Potvrđeno',
    completed: 'Isporučeno',
    thankYou: 'Hvala na porudžbini!',
    estimatedDelivery: 'Očekivana dostava: 2-5 radnih dana'
  }
};

export default function OrderTrackingPage() {
  const { trackingId } = useParams();
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dm-order-public-lang');
    return saved || 'sr';
  });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem('dm-order-public-lang', language);
  }, [language]);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/track/${trackingId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('orderNotFound');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('linkCopied'));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusSteps = [
    { key: 'new', icon: Clock, label: language === 'sr' ? 'Primljeno' : 'Received' },
    { key: 'confirmed', icon: CheckCircle, label: language === 'sr' ? 'Potvrđeno' : 'Confirmed' },
    { key: 'shipped', icon: Truck, label: language === 'sr' ? 'Poslato' : 'Shipped' },
    { key: 'completed', icon: Package, label: language === 'sr' ? 'Isporučeno' : 'Delivered' },
  ];

  const getStatusIndex = (status) => {
    if (status === 'canceled') return -1;
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_customer: 'bg-zinc-500',
      new: 'bg-blue-500',
      confirmed: 'bg-amber-500',
      shipped: 'bg-purple-500',
      completed: 'bg-green-500',
      canceled: 'bg-red-500'
    };
    return colors[status] || 'bg-zinc-500';
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

  const currentStatusIndex = getStatusIndex(order.status);
  const isCanceled = order.status === 'canceled';

  return (
    <div className="min-h-screen bg-zinc-950" data-testid="order-tracking-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <p className="font-medium text-white text-sm">{t('trackOrder')}</p>
              <p className="text-xs text-zinc-400">{order.seller_name}</p>
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

      <main className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
        {/* Order Number & Status */}
        <Card className="bg-zinc-900 border-zinc-800 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400">{t('orderNumber')}</p>
                <p className="text-xl font-bold font-mono text-white">{order.order_number}</p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white border-0 px-3 py-1`}>
                {t(order.status)}
              </Badge>
            </div>
            
            {/* Status Progress */}
            {!isCanceled && (
              <div className="mt-6">
                <div className="flex justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                      style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <div key={step.key} className="relative flex flex-col items-center z-10">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all
                          ${isCompleted 
                            ? 'bg-gradient-to-br from-primary to-orange-500 text-white' 
                            : 'bg-zinc-800 text-zinc-500'}
                          ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`
                          text-xs mt-2 text-center max-w-[60px]
                          ${isCompleted ? 'text-white' : 'text-zinc-500'}
                        `}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Canceled Status */}
            {isCanceled && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-400">{t('canceled')}</p>
              </div>
            )}

            {/* Thank You Message */}
            {!isCanceled && order.status !== 'pending_customer' && (
              <div className="mt-6 text-center">
                <p className="text-green-400">{t('thankYou')}</p>
                <p className="text-sm text-zinc-400 mt-1">{t('estimatedDelivery')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-zinc-900 border-zinc-800 animate-fade-in stagger-1">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-white mb-4">{t('items')}</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <Package className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.name}</p>
                    <p className="text-sm text-zinc-400">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-white">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">{t('total')}</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        {order.customer && (
          <Card className="bg-zinc-900 border-zinc-800 animate-fade-in stagger-2">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t('deliveryAddress')}
                </h3>
                <p className="text-zinc-300">{order.customer.full_name}</p>
                <p className="text-zinc-400 text-sm">{order.customer.address}</p>
                <p className="text-zinc-400 text-sm">{order.customer.city} {order.customer.postal_code}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  {t('contact')}
                </h3>
                <p className="text-zinc-300">{order.customer.phone}</p>
                {order.customer.email && (
                  <p className="text-zinc-400 text-sm">{order.customer.email}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">{t('paymentMethod')}</h3>
                <p className="text-zinc-300">
                  {order.customer.payment_method === 'cash_on_delivery' ? t('cashOnDelivery') : t('bankTransfer')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Copy Tracking Link */}
        <Button 
          variant="outline" 
          className="w-full border-zinc-700 text-white hover:bg-zinc-800 gap-2"
          onClick={copyTrackingLink}
        >
          <Copy className="w-4 h-4" />
          {t('copyLink')}
        </Button>

        {/* Order Date */}
        <p className="text-center text-sm text-zinc-500">
          {language === 'sr' ? 'Kreirano' : 'Created'}: {formatDate(order.created_at)}
          {order.confirmed_at && (
            <span className="block">
              {language === 'sr' ? 'Potvrđeno' : 'Confirmed'}: {formatDate(order.confirmed_at)}
            </span>
          )}
        </p>
      </main>
    </div>
  );
}
