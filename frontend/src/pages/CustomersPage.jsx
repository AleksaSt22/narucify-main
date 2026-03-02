import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Users, Phone, Mail, MapPin, Search, Download, ShoppingBag, ArrowUpDown, Calendar, TrendingUp } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, ordRes] = await Promise.all([
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/orders`)
      ]);
      setCustomers(custRes.data);
      setOrders(ordRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute customer stats from orders
  const customerStats = useMemo(() => {
    const stats = {};
    orders.forEach(order => {
      const phone = order.customer?.phone;
      if (!phone) return;
      if (!stats[phone]) {
        stats[phone] = { orderCount: 0, totalSpent: 0, lastOrder: null };
      }
      stats[phone].orderCount += 1;
      stats[phone].totalSpent += order.total || 0;
      const date = order.created_at;
      if (!stats[phone].lastOrder || date > stats[phone].lastOrder) {
        stats[phone].lastOrder = date;
      }
    });
    return stats;
  }, [orders]);

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => {
      const q = searchQuery.toLowerCase();
      return !q || 
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q);
    });

    result.sort((a, b) => {
      const statsA = customerStats[a.phone] || {};
      const statsB = customerStats[b.phone] || {};
      switch (sortBy) {
        case 'orders': return (statsB.orderCount || 0) - (statsA.orderCount || 0);
        case 'spent': return (statsB.totalSpent || 0) - (statsA.totalSpent || 0);
        case 'recent': return (statsB.lastOrder || '').localeCompare(statsA.lastOrder || '');
        default: return (a.full_name || '').localeCompare(b.full_name || '');
      }
    });

    return result;
  }, [customers, searchQuery, sortBy, customerStats]);

  // Get customer's orders
  const getCustomerOrders = (phone) => {
    return orders.filter(o => o.customer?.phone === phone).sort((a, b) => 
      (b.created_at || '').localeCompare(a.created_at || '')
    );
  };

  const sortOptions = [
    { key: 'name', label: language === 'sr' ? 'Ime' : 'Name' },
    { key: 'orders', label: language === 'sr' ? 'Porudžbine' : 'Orders' },
    { key: 'spent', label: language === 'sr' ? 'Potrošnja' : 'Spent' },
    { key: 'recent', label: language === 'sr' ? 'Poslednja' : 'Recent' },
  ];

  const exportCSV = () => {
    const token = localStorage.getItem('dm-order-token');
    fetch(`${API_URL}/export/customers/csv`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

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
      <div className="space-y-6" data-testid="customers-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">{t('customers')}</h1>
            <p className="text-muted-foreground mt-1">{filteredCustomers.length} {t('items')}</p>
          </div>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
            onClick={exportCSV}
            data-testid="export-customers-btn"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search') + '...'}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              data-testid="customer-search-input"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {sortOptions.map((opt) => (
              <Button
                key={opt.key}
                variant={sortBy === opt.key ? 'default' : 'outline'}
                size="sm"
                className={sortBy === opt.key
                  ? 'primary-gradient text-white'
                  : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }
                onClick={() => setSortBy(opt.key)}
              >
                <ArrowUpDown className="w-3 h-3 mr-1" />
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Ukupno kupaca' : 'Total Customers'}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <ShoppingBag className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => (customerStats[c.phone]?.orderCount || 0) > 1).length}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Povratni kupci' : 'Repeat Buyers'}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {customers.length > 0 
                  ? Math.round(Object.values(customerStats).reduce((s, c) => s + c.totalSpent, 0) / customers.length).toLocaleString('sr-RS')
                  : 0
                }
              </p>
              <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Prosečna potrošnja' : 'Avg. Spend'} (RSD)</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {new Set(customers.map(c => c.city).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Gradova' : 'Cities'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">
                {searchQuery 
                  ? (language === 'sr' ? 'Nema rezultata pretrage' : 'No search results')
                  : t('noCustomers')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer, index) => {
              const stats = customerStats[customer.phone] || {};
              return (
                <Card
                  key={customer.id || index}
                  className="card-hover animate-fade-in cursor-pointer transition-all hover:border-primary/50"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => setSelectedCustomer(customer)}
                  data-testid={`customer-card-${customer.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {customer.full_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">{customer.full_name}</p>
                          {stats.orderCount > 1 && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                              {stats.orderCount}x
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>

                        {customer.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{customer.city}</span>
                          </div>
                        )}

                        {stats.totalSpent > 0 && (
                          <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-zinc-800">
                            <span className="text-muted-foreground">
                              {stats.orderCount} {language === 'sr' ? 'porudžb.' : 'orders'}
                            </span>
                            <span className="text-primary font-medium">
                              {stats.totalSpent.toLocaleString('sr-RS')} RSD
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Customer Detail Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg max-h-[80vh] overflow-y-auto">
            {selectedCustomer && (() => {
              const stats = customerStats[selectedCustomer.phone] || {};
              const custOrders = getCustomerOrders(selectedCustomer.phone);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {selectedCustomer.full_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-lg">{selectedCustomer.full_name}</p>
                        <p className="text-sm text-muted-foreground font-normal">
                          {language === 'sr' ? 'Kupac od' : 'Customer since'} {selectedCustomer.created_at?.slice(0, 10)}
                        </p>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  {/* Contact Info */}
                  <div className="space-y-2 p-3 bg-zinc-900 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{[selectedCustomer.address, selectedCustomer.city, selectedCustomer.postal_code].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-zinc-900 rounded-lg">
                      <p className="text-xl font-bold text-foreground">{stats.orderCount || 0}</p>
                      <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Porudžbine' : 'Orders'}</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-900 rounded-lg">
                      <p className="text-xl font-bold text-primary">{(stats.totalSpent || 0).toLocaleString('sr-RS')}</p>
                      <p className="text-xs text-muted-foreground">RSD</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-900 rounded-lg">
                      <p className="text-xl font-bold text-foreground">
                        {stats.orderCount > 0 ? Math.round(stats.totalSpent / stats.orderCount).toLocaleString('sr-RS') : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{language === 'sr' ? 'Prosečno' : 'Average'}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  {custOrders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-muted-foreground">
                        {language === 'sr' ? 'Istorija porudžbina' : 'Order History'}
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {custOrders.map((order, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-lg text-sm">
                            <div>
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {order.created_at?.slice(0, 10)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-primary">{(order.total || 0).toLocaleString('sr-RS')} RSD</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                order.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                order.status === 'delivered' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
