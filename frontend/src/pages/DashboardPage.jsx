import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/orders`)
      ]);
      setStats(statsRes.data);
      const orderData = ordersRes.data;
      setAllOrders(orderData);
      setRecentOrders(orderData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
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

  // Compute last 7 days revenue chart data
  const weeklyChart = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(language === 'sr' ? 'sr-Latn' : 'en', { weekday: 'short' });
      const dayRevenue = allOrders
        .filter(o => o.created_at?.startsWith(key) && o.status !== 'canceled')
        .reduce((s, o) => s + (o.total || 0), 0);
      days.push({ label: dayLabel, value: dayRevenue });
    }
    return days;
  }, [allOrders, language]);

  const maxChartValue = Math.max(...weeklyChart.map(d => d.value), 1);

  // Today's stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = allOrders.filter(o => o.created_at?.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);

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
      <div className="space-y-6" data-testid="dashboard">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            {t('welcome')}, <span className="gradient-text">{user?.business_name}</span>
          </h1>
          <p className="text-muted-foreground mt-2">{language === 'sr' ? 'Pregled tvog biznisa' : 'Your business overview'}</p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card className="card-hover animate-fade-in stagger-1" data-testid="stat-total-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.total_orders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="card-hover animate-fade-in stagger-2" data-testid="stat-pending-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('pendingOrders')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.pending_orders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-status-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="card-hover animate-fade-in stagger-3" data-testid="stat-completed-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('completedOrders')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.completed_orders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-status-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="card-hover animate-fade-in stagger-4 col-span-2 md:col-span-1" data-testid="stat-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
                  <p className="text-2xl lg:text-3xl font-bold font-heading text-foreground mt-1">
                    {formatCurrency(stats?.total_revenue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-status-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="card-hover animate-fade-in stagger-5" data-testid="stat-products">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalProducts')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.total_products || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="card-hover animate-fade-in stagger-5" data-testid="stat-low-stock">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('lowStock')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.low_stock_products || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-error/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-status-error" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card className="card-hover animate-fade-in stagger-5" data-testid="stat-customers">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalCustomers')}</p>
                  <p className="text-3xl font-bold font-heading text-foreground mt-1">
                    {stats?.total_customers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-status-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Revenue Chart + Today Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mini Bar Chart */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {language === 'sr' ? 'Prihod (poslednjih 7 dana)' : 'Revenue (last 7 days)'}
                </CardTitle>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {language === 'sr' ? 'Detaljnije' : 'Details'} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {weeklyChart.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative flex items-end" style={{ height: '100px' }}>
                      <div 
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{ 
                          height: `${Math.max((day.value / maxChartValue) * 100, 3)}%`,
                          background: day.value > 0 ? 'linear-gradient(to top, #FF5500, #FF7744)' : '#27272a'
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base">
                {language === 'sr' ? 'Danas' : 'Today'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">{todayOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'sr' ? 'porudžbina' : 'orders'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{todayRevenue.toLocaleString('sr-RS')}</p>
                <p className="text-xs text-muted-foreground mt-1">RSD</p>
              </div>
              <button 
                onClick={() => navigate('/orders')}
                className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1 pt-1"
              >
                {language === 'sr' ? 'Sve porudžbine' : 'All orders'} <ArrowRight className="w-3 h-3" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="animate-fade-in" data-testid="recent-orders">
          <CardHeader>
            <CardTitle className="font-heading">{t('recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('noOrders')}</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate('/orders')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.full_name || t('pending_customer')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium text-foreground hidden sm:block">
                        {formatCurrency(order.total)}
                      </p>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {t(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
