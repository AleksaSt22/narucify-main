import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Mail } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
        const { token: authToken, user } = response.data;
        loginWithToken(authToken, user);
        setStatus('success');
        toast.success(t('emailVerified'));
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.detail || t('verificationFailed'));
      }
    };

    if (token) {
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email: resendEmail });
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
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            {status === 'verifying' && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-bold font-heading">{t('verifyingEmail')}</h2>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold font-heading">{t('emailVerified')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('loading')}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold font-heading">{t('verificationFailed')}</h2>
                <p className="text-muted-foreground text-sm">{errorMessage}</p>
                
                <div className="pt-4 space-y-3 text-left">
                  <p className="text-sm text-muted-foreground text-center">{t('requestNewLink')}</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleResend}
                      disabled={resendLoading || !resendEmail}
                      size="icon"
                      variant="outline"
                    >
                      {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Link to="/login" className="block pt-2">
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    {t('backToLogin')}
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
