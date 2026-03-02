import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Building2, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(email, password, businessName);
      if (data.requires_verification) {
        setRegisteredEmail(data.email);
        setRegistrationComplete(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email: registeredEmail });
      toast.success(t('verificationResent'));
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setResendLoading(false);
    }
  };

  // After successful registration — show "check your email" screen
  if (registrationComplete) {
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
          </div>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading mb-2">{t('checkYourEmail')}</h2>
                <p className="text-muted-foreground">
                  {t('verificationEmailSent')} <span className="font-medium text-foreground">{registeredEmail}</span>
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  {t('clickLinkToVerify')}
                </p>
              </div>
              
              <div className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">{t('didntReceiveEmail')}</p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {t('resendVerification')}
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    {t('backToLogin')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-heading">{t('register')}</CardTitle>
            <CardDescription>{t('alreadyHaveAccount')} <Link to="/login" className="text-primary hover:underline">{t('login')}</Link></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">{t('businessName')}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="My Shop"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="register-business-input"
                  />
                </div>
              </div>
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
                    data-testid="register-email-input"
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
                    minLength={6}
                    required
                    data-testid="register-password-input"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full primary-gradient hover:opacity-90" 
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('createAccount')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
