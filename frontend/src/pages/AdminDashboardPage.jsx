import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  BarChart3,
  Wallet,
  Mail,
  UserCog,
  LogOut,
  Search,
  Eye,
  Trash2,
  ChevronRight
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('dm-order-admin-token');
    if (!token) {
      navigate('/admin');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/admin/users`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('dm-order-admin-token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dm-order-admin-token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin');
  };

  const openUserDetail = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      setSelectedUser(response.data);
      setUserDetailOpen(true);
    } catch (error) {
      toast.error('Greška pri učitavanju korisnika');
    }
  };

  const updateUserFeature = async (userId, featureKey, value) => {
    setSavingFeatures(true);
    try {
      const currentFeatures = selectedUser?.features || {};
      const newFeatures = { ...currentFeatures, [featureKey]: value };
      
      await axios.put(`${API_URL}/admin/users/${userId}/features`, {
        features: newFeatures
      });
      
      setSelectedUser(prev => ({ ...prev, features: newFeatures }));
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, features: newFeatures } : u
      ));
      
      toast.success(`${featureKey} ${value ? 'omogućeno' : 'onemogućeno'}`);
      fetchData(); // Refresh stats
    } catch (error) {
      toast.error('Greška pri ažuriranju');
    } finally {
      setSavingFeatures(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika i sve njegove podatke?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      toast.success('Korisnik obrisan');
      setUserDetailOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' RSD';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => 
    user.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuresList = [
    { key: 'analytics', label: 'Analitika', icon: BarChart3, color: 'text-blue-500' },
    { key: 'finances', label: 'Finansije', icon: Wallet, color: 'text-green-500' },
    { key: 'customer_management', label: 'Upravljanje kupcima', icon: UserCog, color: 'text-purple-500' },
    { key: 'email_marketing', label: 'Email marketing', icon: Mail, color: 'text-orange-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-red-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-bold font-heading text-foreground">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Narucify Admin</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
            data-testid="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Odjava
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" data-testid="admin-dashboard">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-red-500/20 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno korisnika</p>
                  <p className="text-3xl font-bold font-heading text-foreground">{stats?.total_users || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 animate-fade-in stagger-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno porudžbina</p>
                  <p className="text-3xl font-bold font-heading text-foreground">{stats?.total_orders_platform || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 animate-fade-in stagger-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno proizvoda</p>
                  <p className="text-3xl font-bold font-heading text-foreground">{stats?.total_products_platform || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 animate-fade-in stagger-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ukupan promet</p>
                  <p className="text-2xl font-bold font-heading text-foreground">{formatCurrency(stats?.total_revenue_platform || 0)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Access Stats */}
        <Card className="border-red-500/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Pristup naprednim funkcijama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuresList.map(feature => {
                const Icon = feature.icon;
                const count = stats?.[`users_with_${feature.key}`] || 0;
                return (
                  <div key={feature.key} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">{feature.label}</p>
                      <p className="text-lg font-bold text-foreground">{count} korisnika</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-red-500/20 animate-fade-in">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="font-heading">Svi korisnici ({users.length})</CardTitle>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pretraži korisnike..."
                  className="pl-10"
                  data-testid="admin-user-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nema korisnika</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-red-500/30 transition-colors cursor-pointer"
                    onClick={() => openUserDetail(user.id)}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    data-testid={`admin-user-${user.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.business_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.business_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">
                          {user.stats?.total_orders || 0} porudžbina • {user.stats?.total_products || 0} proizvoda
                        </p>
                        <p className="text-sm text-primary font-medium">
                          {formatCurrency(user.stats?.total_revenue || 0)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {featuresList.map(f => {
                          const Icon = f.icon;
                          const hasAccess = user.features?.[f.key];
                          return (
                            <div 
                              key={f.key}
                              className={`w-6 h-6 rounded flex items-center justify-center ${hasAccess ? 'bg-green-500/20' : 'bg-muted'}`}
                              title={f.label}
                            >
                              <Icon className={`w-3 h-3 ${hasAccess ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </div>
                          );
                        })}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {selectedUser?.business_name?.[0]?.toUpperCase() || 'U'}
                </div>
                {selectedUser?.business_name}
              </DialogTitle>
              <DialogDescription>{selectedUser?.email}</DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6 mt-4">
                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedUser.stats?.total_orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Porudžbine</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedUser.stats?.total_products || 0}</p>
                    <p className="text-xs text-muted-foreground">Proizvodi</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedUser.stats?.total_customers || 0}</p>
                    <p className="text-xs text-muted-foreground">Kupci</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border text-center">
                    <p className="text-lg font-bold text-primary">{formatCurrency(selectedUser.stats?.total_revenue || 0)}</p>
                    <p className="text-xs text-muted-foreground">Prihod</p>
                  </div>
                </div>

                {/* Feature Access Control */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Pristup naprednim funkcijama</h3>
                  {featuresList.map(feature => {
                    const Icon = feature.icon;
                    const hasAccess = selectedUser.features?.[feature.key] || false;
                    return (
                      <div 
                        key={feature.key}
                        className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${hasAccess ? 'bg-green-500/20' : 'bg-muted'} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${hasAccess ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{feature.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {hasAccess ? 'Omogućeno' : 'Onemogućeno'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={hasAccess}
                          onCheckedChange={(checked) => updateUserFeature(selectedUser.id, feature.key, checked)}
                          disabled={savingFeatures}
                          data-testid={`toggle-${feature.key}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* User Info */}
                <div className="p-4 rounded-lg bg-background border border-border space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Registrovan: {formatDate(selectedUser.created_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: <span className="font-mono text-xs">{selectedUser.id}</span>
                  </p>
                </div>

                {/* Delete User */}
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  onClick={() => deleteUser(selectedUser.id)}
                  data-testid="delete-user-btn"
                >
                  <Trash2 className="w-4 h-4" />
                  Obriši korisnika i sve podatke
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
