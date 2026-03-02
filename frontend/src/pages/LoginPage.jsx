import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailNotVerified(false);
    try {
      await login(email, password);
      toast.success(t('loginSuccess'));
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 403) {
        setEmailNotVerified(true);
      } else {
        toast.error(error.response?.data?.detail || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      toast.success(t('verificationResent'));
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xl font-heading">N</span>
            </div>
            <span className="text-2xl font-bold font-heading text-foreground">Narucify</span>
          </div>
          <p className="text-muted-foreground">DM → Order System</p>
        </div>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading">{t('login')}</CardTitle>
            <CardDescription>{t('dontHaveAccount')} <Link to="/register" className="text-primary hover:underline">{t('register')}</Link></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
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
                    data-testid="login-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full primary-gradient hover:opacity-90" 
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('login')}
              </Button>

              {emailNotVerified && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
                  <p className="text-sm text-yellow-500 font-medium">{t('emailNotVerified')}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    {resendLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {t('resendVerification')}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        
        {/* Admin Link */}
        <div className="text-center mt-6 pt-6 border-t border-border/30">
          <Link 
            to="/admin" 
            className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
            data-testid="admin-login-link"
          >
            Admin Panel →
          </Link>
        </div>
      </div>
    </div>
  );
}
