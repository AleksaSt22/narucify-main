import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  MapPin,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const periods = [
  { value: '7d', labelEn: '7 Days', labelSr: '7 dana' },
  { value: '30d', labelEn: '30 Days', labelSr: '30 dana' },
  { value: '90d', labelEn: '90 Days', labelSr: '90 dana' },
  { value: '365d', labelEn: '1 Year', labelSr: '1 godina' },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/analytics/overview?period=${period}`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(Math.round(amount)) + ' RSD';
  };

  const GrowthIndicator = ({ value }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value)}%
      </span>
    );
  };

  // Simple bar chart component
  const BarChart = ({ data: chartData, maxBars = 14 }) => {
    if (!chartData || chartData.length === 0) return (
      <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
        {language === 'sr' ? 'Nema podataka za ovaj period' : 'No data for this period'}
      </div>
    );
    
    const sliced = chartData.slice(-maxBars);
    const maxVal = Math.max(...sliced.map(d => d.revenue), 1);
    
    return (
      <div className="flex items-end gap-1 h-48">
        {sliced.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full">
              <div
                className="w-full bg-orange-500/80 rounded-t hover:bg-orange-400 transition-colors cursor-pointer min-h-[2px]"
                style={{ height: `${(d.revenue / maxVal) * 160}px` }}
                title={`${d.date}: ${formatCurrency(d.revenue)} (${d.orders} ${language === 'sr' ? 'por.' : 'ord.'})`}
              />
            </div>
            <span className="text-[9px] text-zinc-500 truncate w-full text-center">
              {d.date?.slice(5)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const summary = data?.summary || {};

  return (
    <Layout>
      <div className="space-y-6" data-testid="analytics-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              {language === 'sr' ? 'Analitika' : 'Analytics'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'sr' ? 'Pregled performansi tvog biznisa' : 'Overview of your business performance'}
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
                className={period === p.value ? 'bg-primary text-white' : 'border-zinc-700 text-zinc-400'}
              >
                {language === 'sr' ? p.labelSr : p.labelEn}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Prihod' : 'Revenue'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-foreground mt-1">
                    {formatCurrency(summary.total_revenue || 0)}
                  </p>
                  <GrowthIndicator value={summary.revenue_growth || 0} />
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Porudžbine' : 'Orders'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-foreground mt-1">
                    {summary.total_orders || 0}
                  </p>
                  <GrowthIndicator value={summary.orders_growth || 0} />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Prosečna vrednost' : 'Avg Order Value'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-foreground mt-1">
                    {formatCurrency(summary.avg_order_value || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Period' : 'Period'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-foreground mt-1">
                    {periods.find(p => p.value === period)?.[language === 'sr' ? 'labelSr' : 'labelEn']}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="animate-fade-in bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Dnevni prihod' : 'Daily Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data?.daily || []} maxBars={period === '7d' ? 7 : period === '365d' ? 30 : 14} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card className="animate-fade-in bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {language === 'sr' ? 'Najprodavaniji proizvodi' : 'Top Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.top_products?.length > 0 ? (
                <div className="space-y-3">
                  {data.top_products.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary w-6">#{i + 1}</span>
                        <span className="text-sm text-foreground">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{p.quantity} {language === 'sr' ? 'kom' : 'pcs'}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(p.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">
                  {language === 'sr' ? 'Nema podataka' : 'No data yet'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card className="animate-fade-in bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {language === 'sr' ? 'Top gradovi' : 'Top Cities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.top_cities?.length > 0 ? (
                <div className="space-y-3">
                  {data.top_cities.map((c, i) => {
                    const maxOrders = data.top_cities[0]?.orders || 1;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{c.city}</span>
                          <span className="text-sm text-muted-foreground">{c.orders} {language === 'sr' ? 'por.' : 'ord.'}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(c.orders / maxOrders) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">
                  {language === 'sr' ? 'Nema podataka' : 'No data yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Status Distribution */}
        <Card className="animate-fade-in bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              {language === 'sr' ? 'Distribucija statusa' : 'Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data?.order_statuses && Object.entries(data.order_statuses).map(([status, count]) => {
                const colors = {
                  pending_customer: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  confirmed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                  shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
                  canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
                };
                return (
                  <div key={status} className={`px-4 py-3 rounded-lg border ${colors[status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs mt-1">{t(status) || status}</p>
                  </div>
                );
              })}
              {(!data?.order_statuses || Object.keys(data.order_statuses).length === 0) && (
                <p className="text-zinc-500">
                  {language === 'sr' ? 'Nema porudžbina' : 'No orders yet'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
