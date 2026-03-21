import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Store, Package, Share2, Check, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const sr = language === 'sr';

  const steps = [
    {
      icon: Store,
      title: sr ? 'Podesi svoju prodavnicu' : 'Set up your shop',
      desc: sr ? 'Kako se zove tvoj biznis?' : 'What is your business name?',
    },
    {
      icon: Package,
      title: sr ? 'Dodaj prvi proizvod' : 'Add your first product',
      desc: sr ? 'Možeš odmah dodati proizvode ili kasnije.' : 'You can add products now or later.',
    },
    {
      icon: Share2,
      title: sr ? 'Podeli svoju prodavnicu' : 'Share your shop',
      desc: sr ? 'Kopiraj link i podeli sa kupcima!' : 'Copy your link and share with customers!',
    },
  ];

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/onboarding/complete`, {
        shop_name: shopName || user?.business_name,
        shop_description: shopDescription,
      });
      await refreshUser();
      toast.success(sr ? 'Sve je spremno! 🎉' : 'All set! 🎉');
      navigate('/dashboard');
    } catch {
      toast.error(sr ? 'Greška' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = async () => {
    try {
      await axios.post(`${API_URL}/onboarding/skip`);
      await refreshUser();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  const shopUrl = user?.id ? `${window.location.origin}/shop/${user.id}` : '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-primary w-12' : 'bg-muted w-8'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center mx-auto mb-4">
                    {(() => { const Icon = steps[step].icon; return <Icon className="w-8 h-8 text-white" />; })()}
                  </div>
                  <h2 className="text-2xl font-bold font-heading">{steps[step].title}</h2>
                  <p className="text-muted-foreground mt-1">{steps[step].desc}</p>
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <Input
                      placeholder={sr ? 'Ime prodavnice' : 'Shop name'}
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="text-center text-lg h-12"
                    />
                    <Textarea
                      placeholder={sr ? 'Kratki opis (opciono)' : 'Short description (optional)'}
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-6 text-center border border-border/50">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {sr
                          ? 'Dodaj proizvode iz sekcije Proizvodi nakon podešavanja.'
                          : 'Add products from the Products section after setup.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          completeOnboarding();
                          setTimeout(() => navigate('/products'), 300);
                        }}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {sr ? 'Idi na proizvode' : 'Go to products'}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">{sr ? 'Link tvoje prodavnice:' : 'Your shop link:'}</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background p-2 rounded border border-border truncate">
                          {shopUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(shopUrl);
                            toast.success(sr ? 'Link kopiran!' : 'Link copied!');
                          }}
                        >
                          {sr ? 'Kopiraj' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {sr
                        ? 'Podeli ovaj link na Instagramu, WhatsApp-u ili bilo gde!'
                        : 'Share this link on Instagram, WhatsApp or anywhere!'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={skipOnboarding}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {sr ? 'Preskoči' : 'Skip'}
                  </button>

                  {step < 2 ? (
                    <Button onClick={() => setStep(step + 1)} className="gap-2">
                      {sr ? 'Dalje' : 'Next'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={completeOnboarding} disabled={loading} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      {loading ? '...' : (sr ? 'Završi podešavanje' : 'Finish setup')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
