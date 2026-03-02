import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Shield } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('dm-order-admin-token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Narucify Admin</p>
        </div>
        
        <Card className="border-red-500/20 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading">Super Admin</CardTitle>
            <CardDescription>Pristup za administratora platforme</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@narucify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="admin-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="admin-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-500 hover:bg-red-600" 
                disabled={loading}
                data-testid="admin-login-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                Admin Prijava
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          <a href="/login" className="text-primary hover:underline">← Nazad na korisnički login</a>
        </p>
      </div>
    </div>
  );
}
