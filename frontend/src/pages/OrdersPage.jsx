import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Plus, 
  Copy, 
  Eye, 
  MoreVertical, 
  ShoppingCart, 
  Loader2,
  Minus,
  X,
  Link as LinkIcon,
  Check,
  Search,
  Clock,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PUBLIC_URL = window.location.origin;

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Order creation state
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [newDeliveryDays, setNewDeliveryDays] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/orders`),
        axios.get(`${API_URL}/products`)
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setOrderItems([]);
    setOrderNotes('');
    setCreateDialogOpen(true);
  };

  const addProductToOrder = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = orderItems.find(item => item.product_id === productId);
    if (existing) {
      setOrderItems(orderItems.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product_id: productId,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
        stock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setOrderItems(orderItems.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error(t('selectProducts'));
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API_URL}/orders`, {
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        notes: orderNotes
      });
      
      toast.success(t('orderCreated'));
      setCreateDialogOpen(false);
      
      // Show link dialog
      const link = `${PUBLIC_URL}/order/${response.data.link_token}`;
      setGeneratedLink(link);
      setLinkDialogOpen(true);
      
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const copyLink = (linkToken) => {
    const link = `${PUBLIC_URL}/order/${linkToken}`;
    navigator.clipboard.writeText(link);
    toast.success(t('linkCopied'));
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      toast.success(t('statusUpdated'));
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('error'));
    }
  };

  const openDeliveryDialog = (order) => {
    setSelectedOrderForDelivery(order);
    setNewDeliveryDays(order.estimated_delivery_days?.toString() || '3');
    setDeliveryDialogOpen(true);
  };

  const updateDeliveryTime = async () => {
    if (!selectedOrderForDelivery) return;
    try {
      await axios.put(`${API_URL}/orders/${selectedOrderForDelivery.id}/status`, { 
        status: selectedOrderForDelivery.status,
        estimated_delivery_days: parseInt(newDeliveryDays)
      });
      toast.success(t('updateDelivery'));
      setDeliveryDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating delivery time:', error);
      toast.error(t('error'));
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_customer: 'status-pending_customer',
      new: 'status-new',
      confirmed: 'status-confirmed',
      shipped: 'status-shipped',
      completed: 'status-completed',
      canceled: 'status-canceled'
    };
    return colors[status] || 'bg-muted';
  };

  const statuses = ['pending_customer', 'new', 'confirmed', 'shipped', 'completed', 'canceled'];
  
  // Filter by status and search
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="orders-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">{t('orders')}</h1>
            <p className="text-muted-foreground mt-1">{orders.length} {t('items')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={openCreateDialog} 
              className="primary-gradient hover:opacity-90 gap-2"
              disabled={products.length === 0}
              data-testid="create-order-btn"
            >
              <Plus className="w-4 h-4" />
              {t('createOrder')}
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              onClick={() => {
                const link = `${API_URL}/export/orders/csv`;
                const token = localStorage.getItem('dm-order-token');
                fetch(link, { headers: { 'Authorization': `Bearer ${token}` } })
                  .then(res => res.blob())
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  });
              }}
              data-testid="export-orders-btn"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              onClick={() => {
                const link = `${API_URL}/export/orders/pdf`;
                const token = localStorage.getItem('dm-order-token');
                fetch(link, { headers: { 'Authorization': `Bearer ${token}` } })
                  .then(res => res.blob())
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `orders_${new Date().toISOString().slice(0,10)}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  });
              }}
              data-testid="export-orders-pdf-btn"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('search') + '...'}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              data-testid="order-search-input"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={statusFilter === 'all' ? 'primary-gradient text-white' : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'}
            >
              {t('all')}
            </Button>
            {statuses.map(status => (
              <Button 
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                className={statusFilter === status ? 'primary-gradient text-white' : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'}
              >
                {t(status)}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="animate-fade-in bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
              <p className="text-xl font-medium text-white mb-2">{t('noOrders')}</p>
              <p className="text-zinc-400 mb-6">{t('createOrder')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="space-y-3">
            {paginatedOrders.map((order, index) => (
              <Card 
                key={order.id} 
                className="card-hover animate-fade-in bg-zinc-900 border-zinc-800"
                style={{ animationDelay: `${index * 0.03}s` }}
                data-testid={`order-card-${order.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-foreground font-mono">{order.order_number}</p>
                        <Badge className={`${getStatusColor(order.status)} border-0`}>
                          {t(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.full_name || t('pending_customer')}
                        {order.customer?.phone && ` • ${order.customer.phone}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        {formatDate(order.created_at)} • {order.items.length} {order.items.length === 1 ? t('item') : t('items')}
                        {order.estimated_delivery_days && (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Truck className="w-3 h-3" />
                            {order.estimated_delivery_days} {t('deliveryDays')}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Total & Actions */}
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openDeliveryDialog(order)}
                        title={t('updateDelivery')}
                        data-testid={`delivery-${order.id}`}
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyLink(order.link_token)}
                        title={t('copyLink')}
                        data-testid={`copy-link-${order.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => viewOrder(order)}
                        title={t('viewOrder')}
                        data-testid={`view-order-${order.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" data-testid={`order-menu-${order.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statuses.filter(s => s !== 'pending_customer').map(status => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              disabled={order.status === status}
                            >
                              {t(status)} {order.status === status && <Check className="w-4 h-4 ml-2" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline" size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-9 w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '...' ? (
                  <span key={`dots-${i}`} className="px-1 text-zinc-500">…</span>
                ) : (
                  <Button
                    key={p} variant={currentPage === p ? 'default' : 'outline'}
                    size="icon" className="h-9 w-9"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              <Button
                variant="outline" size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-9 w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-zinc-500 ml-2">
                {filteredOrders.length} {t('orders').toLowerCase()}
              </span>
            </div>
          )}
          </>
        )}

        {/* Create Order Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{t('createOrder')}</DialogTitle>
              <DialogDescription>{t('selectProducts')}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Product Selector */}
              <div className="space-y-2">
                <Label>{t('selectProducts')}</Label>
                <Select onValueChange={addProductToOrder}>
                  <SelectTrigger data-testid="product-selector">
                    <SelectValue placeholder={t('selectProducts')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id} disabled={product.stock === 0}>
                        {product.name} - {formatCurrency(product.price)} ({t('stock')}: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Items */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('items')}</Label>
                  <div className="space-y-2">
                    {orderItems.map(item => (
                      <div 
                        key={item.product_id} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border"
                      >
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromOrder(item.product_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t('orderNotes')}</Label>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={t('orderNotes')}
                  rows={2}
                  data-testid="order-notes-input"
                />
              </div>

              {/* Total */}
              {orderItems.length > 0 && (
                <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="font-medium text-foreground">{t('total')}</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleCreateOrder}
                  className="flex-1 primary-gradient hover:opacity-90"
                  disabled={orderItems.length === 0 || saving}
                  data-testid="generate-link-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {t('generateLink')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Link Generated Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Check className="w-5 h-5 text-status-success" />
                {t('orderCreated')}
              </DialogTitle>
              <DialogDescription>{t('copyLink')}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={generatedLink} 
                  readOnly 
                  className="font-mono text-sm"
                  data-testid="generated-link-input"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    toast.success(t('linkCopied'));
                  }}
                  className="primary-gradient hover:opacity-90"
                  data-testid="copy-generated-link-btn"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('copyLink')} → DM
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Order Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {selectedOrder?.order_number}
              </DialogTitle>
              <DialogDescription>
                {selectedOrder && formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="mt-4 space-y-4">
                <Badge className={`${getStatusColor(selectedOrder.status)} border-0`}>
                  {t(selectedOrder.status)}
                </Badge>

                {/* Items */}
                <div className="space-y-2">
                  <Label>{t('items')}</Label>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="font-medium text-foreground">{t('total')}</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                </div>

                {/* Customer Info */}
                {selectedOrder.customer && (
                  <div className="space-y-2">
                    <Label>{t('customer')}</Label>
                    <div className="p-4 rounded-lg bg-background border border-border space-y-1">
                      <p className="font-medium text-foreground">{selectedOrder.customer.full_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customer.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.customer.city} {selectedOrder.customer.postal_code}
                      </p>
                      {selectedOrder.customer.email && (
                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
                      )}
                      <p className="text-sm text-primary mt-2">
                        {selectedOrder.customer.payment_method === 'cash_on_delivery' ? t('cashOnDelivery') : t('bankTransfer')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <Label>{t('orderNotes')}</Label>
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-background border border-border">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Copy Link */}
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => copyLink(selectedOrder.link_token)}
                >
                  <Copy className="w-4 h-4" />
                  {t('copyLink')}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Delivery Time Dialog */}
        <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('updateDelivery')}
              </DialogTitle>
              <DialogDescription>
                {selectedOrderForDelivery?.order_number}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>{t('expectedDelivery')}</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number"
                    min="1"
                    max="30"
                    value={newDeliveryDays}
                    onChange={(e) => setNewDeliveryDays(e.target.value)}
                    className="w-24"
                    data-testid="delivery-days-input"
                  />
                  <span className="text-muted-foreground">{t('deliveryDays')}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeliveryDialogOpen(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={updateDeliveryTime}
                  className="flex-1 primary-gradient hover:opacity-90"
                  data-testid="save-delivery-btn"
                >
                  {t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
