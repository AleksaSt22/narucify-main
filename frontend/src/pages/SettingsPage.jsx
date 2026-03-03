import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Globe, 
  BarChart3, 
  Wallet, 
  Users, 
  Mail,
  Building2,
  Check,
  Sparkles,
  TrendingUp,
  Package,
  Crown,
  Zap,
  Target,
  PieChart,
  FileSpreadsheet,
  Send,
  Eye,
  ArrowRight,
  Copy,
  Gift,
  Award,
  Star,
  ShoppingBag,
  Palette,
  Headphones,
  Clock,
  Store,
  Trash2,
  ExternalLink,
  Trophy
} from 'lucide-react';
import BadgeCelebration from '../components/BadgeCelebration';
import { themes } from './MiniShopPage';
import '../styles/premium.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);
  const [loadingShopProducts, setLoadingShopProducts] = useState(true);
  const [celebrationBadge, setCelebrationBadge] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(user?.shop_theme || 'elegance');
  const [shopDescription, setShopDescription] = useState(user?.shop_description || '');
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    fetchShopProducts();
    checkForNewBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkForNewBadges = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      const userData = response.data;
      // Check if there are new badges
      if (userData.new_badges && userData.new_badges.length > 0) {
        // Show celebration for the highest new badge
        setCelebrationBadge(userData.new_badges[userData.new_badges.length - 1]);
        // Refresh user to update badges in context
        if (refreshUser) {
          refreshUser();
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const handleBadgeCelebrationClose = async () => {
    setCelebrationBadge(null);
    // Mark badges as seen
    try {
      await axios.post(`${API_URL}/auth/badges-seen`);
    } catch (error) {
      console.error('Error marking badges as seen:', error);
    }
  };

  const fetchShopProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const productsInShop = response.data.filter(p => p.show_in_shop);
      setShopProducts(productsInShop);
    } catch (error) {
      console.error('Error fetching shop products:', error);
    } finally {
      setLoadingShopProducts(false);
    }
  };

  const removeFromShop = async (productId) => {
    try {
      await axios.put(`${API_URL}/products/${productId}/shop`);
      toast.success(language === 'sr' ? 'Proizvod uklonjen iz prodavnice' : 'Product removed from shop');
      fetchShopProducts();
    } catch (error) {
      console.error('Error removing from shop:', error);
      toast.error(t('error'));
    }
  };

  const badgeInfo = {
    starter_seller: { 
      label: language === 'sr' ? 'Početnik Prodavac' : 'Starter Seller', 
      color: 'from-zinc-400 to-zinc-600',
      icon: Star,
      desc: language === 'sr' ? '10+ porudžbina' : '10+ orders',
      tier: 1
    },
    active_seller: { 
      label: language === 'sr' ? 'Aktivan Prodavac' : 'Active Seller', 
      color: 'from-blue-400 to-cyan-500',
      icon: Zap,
      desc: language === 'sr' ? '50+ porudžbina' : '50+ orders',
      tier: 2
    },
    power_seller: { 
      label: language === 'sr' ? 'Power Seller' : 'Power Seller', 
      color: 'from-purple-400 to-pink-500',
      icon: Trophy,
      desc: language === 'sr' ? '100+ porudžbina' : '100+ orders',
      tier: 3
    },
    super_seller: { 
      label: language === 'sr' ? 'Super Prodavac' : 'Super Seller', 
      color: 'from-amber-400 to-orange-500',
      icon: Crown,
      desc: language === 'sr' ? '500+ porudžbina' : '500+ orders',
      tier: 4
    }
  };

  const premiumFeatures = [
    {
      key: 'analytics',
      icon: BarChart3,
      title: language === 'sr' ? 'Analitika' : 'Analytics',
      price: '5.99',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      shortDesc: language === 'sr' 
        ? 'Statistika prodaje i trendovi' 
        : 'Sales statistics and trends',
      fullDesc: language === 'sr'
        ? 'Saznaj tačno šta se prodaje, kada i koliko. Vidi koji proizvodi donose najviše prihoda.'
        : 'Know exactly what sells, when and how much. See which products bring the most revenue.',
      problem: language === 'sr'
        ? 'Problem: Ne znaš koji proizvodi ti donose najviše novca, gubiš vreme na proizvode koji se ne prodaju.'
        : 'Problem: You don\'t know which products bring the most money, wasting time on products that don\'t sell.',
      solution: language === 'sr'
        ? 'Rešenje: Analitika ti pokazuje top 10 proizvoda, dnevne/nedeljne/mesečne trendove, i predviđa koji proizvodi će biti hit.'
        : 'Solution: Analytics shows you top 10 products, daily/weekly/monthly trends, and predicts which products will be hits.',
      tips: language === 'sr' ? [
        'Prati koje dane u nedelji imaš najviše porudžbina',
        'Fokusiraj marketing na top 3 proizvoda',
        'Ukloni proizvode koji se ne prodaju mesec dana'
      ] : [
        'Track which days of the week you have the most orders',
        'Focus marketing on top 3 products',
        'Remove products that haven\'t sold for a month'
      ],
      features: language === 'sr' ? [
        'Grafikon prodaje po danima',
        'Top 10 najprodavanijih proizvoda',
        'Prihod po kategorijama',
        'Uporedna analiza perioda'
      ] : [
        'Sales chart by days',
        'Top 10 best-selling products',
        'Revenue by categories',
        'Comparative period analysis'
      ]
    },
    {
      key: 'finances',
      icon: Wallet,
      title: language === 'sr' ? 'Finansije' : 'Finances',
      price: '7.99',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
      shortDesc: language === 'sr' 
        ? 'Praćenje prihoda i troškova' 
        : 'Income and expense tracking',
      fullDesc: language === 'sr'
        ? 'Znaj tačno koliko zarađuješ. Prati troškove, izračunaj profit i planiraj budžet.'
        : 'Know exactly how much you earn. Track expenses, calculate profit and plan your budget.',
      problem: language === 'sr'
        ? 'Problem: Prodaješ, ali ne znaš koliko ti zapravo ostaje nakon svih troškova.'
        : 'Problem: You\'re selling, but don\'t know how much actually remains after all expenses.',
      solution: language === 'sr'
        ? 'Rešenje: Finansijski modul automatski računa profit, pokazuje troškove i daje ti jasan pregled novčanog toka.'
        : 'Solution: Finance module automatically calculates profit, shows expenses and gives you a clear cash flow overview.',
      tips: language === 'sr' ? [
        'Unesi sve troškove (dostava, pakovanje, reklame)',
        'Prati mesečni profit, ne samo prihod',
        'Postavi ciljni profit i prati napredak'
      ] : [
        'Enter all expenses (shipping, packaging, ads)',
        'Track monthly profit, not just revenue',
        'Set target profit and track progress'
      ],
      features: language === 'sr' ? [
        'Automatski proračun profita',
        'Evidencija troškova',
        'Mesečni finansijski izveštaji',
        'Profit po proizvodu'
      ] : [
        'Automatic profit calculation',
        'Expense tracking',
        'Monthly financial reports',
        'Profit per product'
      ]
    },
    {
      key: 'inventory_view',
      icon: Package,
      title: language === 'sr' ? 'Pregled Stanja' : 'Inventory View',
      price: '2.99',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
      shortDesc: language === 'sr' 
        ? 'Kompletan pregled lagera' 
        : 'Complete inventory overview',
      fullDesc: language === 'sr'
        ? 'Vidi ceo lager u svakom trenutku. Nikad više ne prodaj nešto što nemaš na stanju.'
        : 'See entire inventory at any time. Never sell something you don\'t have in stock again.',
      problem: language === 'sr'
        ? 'Problem: Besplatna verzija ti javlja tek kad je malo na stanju - tada je već kasno za naručivanje.'
        : 'Problem: Free version only alerts when stock is low - by then it\'s too late to reorder.',
      solution: language === 'sr'
        ? 'Rešenje: Premium ti daje kompletan pregled lagera 24/7, sa filterima i pretragom.'
        : 'Solution: Premium gives you complete inventory view 24/7, with filters and search.',
      tips: language === 'sr' ? [
        'Proveri stanje pre nego što objaviš proizvod',
        'Naruči nove zalihe kad padne ispod 20%',
        'Koristi filter za proizvode koji se brzo prodaju'
      ] : [
        'Check stock before posting a product',
        'Order new supplies when it drops below 20%',
        'Use filter for fast-selling products'
      ],
      features: language === 'sr' ? [
        'Pregled svih proizvoda i količina',
        'Filter i pretraga lagera',
        'Istorija promena stanja',
        'Export lagera u Excel'
      ] : [
        'View all products and quantities',
        'Inventory filter and search',
        'Stock change history',
        'Export inventory to Excel'
      ],
      hasFreeVersion: true,
      freeVersionDesc: language === 'sr' 
        ? 'FREE verzija: Samo obaveštenje kad je malo na stanju'
        : 'FREE version: Only notification when stock is low'
    },
    {
      key: 'customer_management',
      icon: Users,
      title: language === 'sr' ? 'Upravljanje Kupcima' : 'Customer Management',
      price: '5.99',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      shortDesc: language === 'sr' 
        ? 'Baza kupaca i istorija' 
        : 'Customer database and history',
      fullDesc: language === 'sr'
        ? 'Upoznaj svoje kupce. Vidi ko kupuje najviše, ko se vraća, i ko su tvoji VIP kupci.'
        : 'Know your customers. See who buys the most, who returns, and who your VIP customers are.',
      problem: language === 'sr'
        ? 'Problem: Kupci ti pišu, a ti ne znaš da li su već kupovali i šta su kupili.'
        : 'Problem: Customers message you, but you don\'t know if they\'ve bought before and what they bought.',
      solution: language === 'sr'
        ? 'Rešenje: Kompletna baza kupaca sa istorijom kupovina, segmentacijom i VIP statusom.'
        : 'Solution: Complete customer database with purchase history, segmentation and VIP status.',
      tips: language === 'sr' ? [
        'Ponudi popust kupcima koji se vraćaju',
        'VIP kupcima pošalji ekskluzivne ponude',
        'Kontaktiraj kupce koji dugo nisu kupovali'
      ] : [
        'Offer discount to returning customers',
        'Send exclusive offers to VIP customers',
        'Contact customers who haven\'t bought in a while'
      ],
      features: language === 'sr' ? [
        'Istorija svih kupovina po kupcu',
        'Automatska VIP segmentacija',
        'Beleške o kupcima',
        'Filteri i pretraga kupaca'
      ] : [
        'All purchase history per customer',
        'Automatic VIP segmentation',
        'Customer notes',
        'Customer filters and search'
      ]
    },
    {
      key: 'email_marketing',
      icon: Mail,
      title: language === 'sr' ? 'Marketing' : 'Marketing',
      price: '9.99',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-400',
      shortDesc: language === 'sr' 
        ? 'Email kampanje i promocije' 
        : 'Email campaigns and promotions',
      fullDesc: language === 'sr'
        ? 'Pošalji promocije direktno kupcima koji su se prijavili. Povećaj prodaju sa ciljanim kampanjama.'
        : 'Send promotions directly to subscribed customers. Increase sales with targeted campaigns.',
      problem: language === 'sr'
        ? 'Problem: Imaš listu kupaca ali ne znaš kako da ih ponovo kontaktiraš za nove proizvode.'
        : 'Problem: You have a customer list but don\'t know how to contact them again for new products.',
      solution: language === 'sr'
        ? 'Rešenje: Pošalji email kampanje direktno iz sistema ili exportuj listu za drugi softver.'
        : 'Solution: Send email campaigns directly from the system or export the list for other software.',
      tips: language === 'sr' ? [
        'Pošalji kampanju kad dodaš nove proizvode',
        'Napravi ekskluzivnu ponudu samo za pretplatnike',
        'Šalji max 2-3 emaila mesečno da ne dosađuješ'
      ] : [
        'Send campaign when you add new products',
        'Create exclusive offer only for subscribers',
        'Send max 2-3 emails per month to not annoy'
      ],
      features: language === 'sr' ? [
        'Lista svih pretplaćenih kupaca',
        'Slanje email kampanja',
        'Export u CSV za druge alate',
        'Statistika otvaranja emailova'
      ] : [
        'List of all subscribed customers',
        'Send email campaigns',
        'Export to CSV for other tools',
        'Email open statistics'
      ]
    },
    {
      key: 'custom_branding',
      icon: Palette,
      title: language === 'sr' ? 'Custom Branding' : 'Custom Branding',
      price: '4.99',
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      shortDesc: language === 'sr' 
        ? 'Dodaj svoj logo, ukloni watermark' 
        : 'Add your logo, remove watermark',
      fullDesc: language === 'sr'
        ? 'Profesionalan izgled sa tvojim brendom. Ukloni Narucify watermark i dodaj svoj logo.'
        : 'Professional look with your brand. Remove Narucify watermark and add your logo.',
      problem: language === 'sr'
        ? 'Problem: Kupci vide "Powered by Narucify" što deluje neprofesionalno za tvoj brend.'
        : 'Problem: Customers see "Powered by Narucify" which looks unprofessional for your brand.',
      solution: language === 'sr'
        ? 'Rešenje: Ukloni watermark i dodaj svoj logo na sve stranice koje kupci vide.'
        : 'Solution: Remove watermark and add your logo to all customer-facing pages.',
      tips: language === 'sr' ? [
        'Koristi logo veličine min 200x200px',
        'Beli ili transparentan background za logo',
        'Konzistentan brending povećava poverenje'
      ] : [
        'Use logo size min 200x200px',
        'White or transparent background for logo',
        'Consistent branding increases trust'
      ],
      features: language === 'sr' ? [
        'Uklanjanje Narucify watermark-a',
        'Upload svog loga',
        'Logo na svim stranicama',
        'Profesionalan izgled'
      ] : [
        'Remove Narucify watermark',
        'Upload your logo',
        'Logo on all pages',
        'Professional look'
      ]
    },
    {
      key: 'priority_support',
      icon: Headphones,
      title: language === 'sr' ? 'Priority Support' : 'Priority Support',
      price: '3.99',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-500/10',
      iconColor: 'text-teal-400',
      shortDesc: language === 'sr' 
        ? 'Prioritetna podrška 24/7' 
        : '24/7 Priority support',
      fullDesc: language === 'sr'
        ? 'Dobij pomoć brže od svih. Tvoji zahtevi imaju prioritet nad besplatnim korisnicima.'
        : 'Get help faster than anyone. Your requests have priority over free users.',
      problem: language === 'sr'
        ? 'Problem: Kad imaš problem, čekaš dugo na odgovor dok gubiš porudžbine.'
        : 'Problem: When you have an issue, you wait long for response while losing orders.',
      solution: language === 'sr'
        ? 'Rešenje: Priority support znači odgovor u roku od 2 sata, ne 24.'
        : 'Solution: Priority support means response within 2 hours, not 24.',
      tips: language === 'sr' ? [
        'Koristi chat za hitne probleme',
        'Opišite problem detaljno za brže rešenje',
        'Screenshot greške ubrzava dijagnozu'
      ] : [
        'Use chat for urgent issues',
        'Describe the problem in detail for faster resolution',
        'Screenshot of error speeds up diagnosis'
      ],
      features: language === 'sr' ? [
        'Odgovor u roku od 2 sata',
        'Direktan kontakt sa timom',
        'Video pozivi za kompleksne probleme',
        'Prioritet nad besplatnim korisnicima'
      ] : [
        'Response within 2 hours',
        'Direct contact with team',
        'Video calls for complex issues',
        'Priority over free users'
      ]
    }
  ];

  const proPrice = '13.99';
  const regularPrice = '45.93';

  const hasFeatureAccess = (featureKey) => {
    return user?.features?.[featureKey] === true || user?.is_pro;
  };

  const openFeatureModal = (feature) => {
    setSelectedFeature(feature);
    setFeatureModalOpen(true);
  };

  const copyReferralCode = () => {
    const code = user?.referral_code || '';
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setReferralCopied(true);
    toast.success(language === 'sr' ? 'Link kopiran!' : 'Link copied!');
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const shopLink = `${window.location.origin}/shop/${user?.id}`;

  const saveShopTheme = async (themeKey) => {
    setCurrentTheme(themeKey);
    setSavingTheme(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, { shop_theme: themeKey });
      toast.success(language === 'sr' ? 'Tema sačuvana!' : 'Theme saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error(language === 'sr' ? 'Greška pri čuvanju teme' : 'Error saving theme');
    } finally {
      setSavingTheme(false);
    }
  };

  const saveShopDescription = async () => {
    try {
      await axios.put(`${API_URL}/auth/profile`, { shop_description: shopDescription });
      toast.success(language === 'sr' ? 'Opis sačuvan!' : 'Description saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving description:', error);
      toast.error(language === 'sr' ? 'Greška' : 'Error');
    }
  };

  const themeDisplayInfo = {
    elegance: { 
      label: 'Elegance', 
      desc: language === 'sr' ? 'Elegantan svetao dizajn' : 'Elegant light design',
      preview: ['bg-stone-50', 'bg-stone-900', 'bg-stone-200']
    },
    midnight: { 
      label: 'Midnight', 
      desc: language === 'sr' ? 'Tamna tema sa ljubičastim akcentom' : 'Dark theme with violet accent',
      preview: ['bg-zinc-950', 'bg-violet-600', 'bg-zinc-800']
    },
    sunset: { 
      label: 'Sunset', 
      desc: language === 'sr' ? 'Topli narandžasto-roze tonovi' : 'Warm orange-pink tones',
      preview: ['bg-orange-50', 'bg-gradient-to-r from-orange-500 to-rose-500', 'bg-orange-100']
    },
    nature: { 
      label: 'Nature', 
      desc: language === 'sr' ? 'Sveži zeleni tonovi' : 'Fresh green tones',
      preview: ['bg-emerald-50', 'bg-emerald-600', 'bg-emerald-100']
    },
    ocean: { 
      label: 'Ocean', 
      desc: language === 'sr' ? 'Tamna tema sa plavim akcentom' : 'Dark theme with cyan accent',
      preview: ['bg-slate-900', 'bg-gradient-to-r from-cyan-500 to-blue-600', 'bg-slate-700']
    },
    minimal: { 
      label: 'Minimal', 
      desc: language === 'sr' ? 'Čist minimalistički dizajn' : 'Clean minimalist design',
      preview: ['bg-white', 'bg-neutral-900', 'bg-neutral-100']
    },
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl" data-testid="settings-page">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-heading text-white">{t('settings')}</h1>
        </div>

        {/* Profile Section */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 text-primary" />
              {t('profile')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user?.business_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-lg font-medium text-white flex items-center gap-2">
                  {user?.business_name}
                  {user?.is_pro && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-zinc-400">{user?.email}</p>
              </div>
            </div>

            {/* Badges */}
            {user?.badges && user.badges.length > 0 && (
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {language === 'sr' ? 'Tvoji bedževi' : 'Your badges'}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {user.badges.map(badge => {
                    const info = badgeInfo[badge];
                    const Icon = info?.icon || Star;
                    return (
                      <div 
                        key={badge}
                        className={`relative group cursor-pointer`}
                      >
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${info?.color} blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />
                        <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${info?.color} shadow-lg`}>
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{info?.label}</p>
                            <p className="text-xs text-white/70">{info?.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badge Progress */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 mb-3">
                {language === 'sr' ? 'Napredak ka sledećem bedžu' : 'Progress to next badge'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(badgeInfo).map(([key, info]) => {
                  const hasIt = user?.badges?.includes(key);
                  const Icon = info.icon;
                  return (
                    <div 
                      key={key}
                      className={`relative p-4 rounded-xl border transition-all ${
                        hasIt 
                          ? 'border-transparent bg-gradient-to-br from-zinc-800 to-zinc-900' 
                          : 'border-zinc-700/50 bg-zinc-800/30'
                      }`}
                    >
                      {hasIt && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${info.color} opacity-10`} />
                      )}
                      <div className="relative z-10">
                        <div className={`w-10 h-10 rounded-lg ${
                          hasIt 
                            ? `bg-gradient-to-br ${info.color}` 
                            : 'bg-zinc-700/50'
                        } flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${hasIt ? 'text-white' : 'text-zinc-500'}`} />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          {hasIt && (
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-400" />
                            </div>
                          )}
                          <span className={`text-sm font-semibold ${hasIt ? 'text-white' : 'text-zinc-500'}`}>
                            {info.label}
                          </span>
                        </div>
                        <p className={`text-xs ${hasIt ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {info.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moja Ponuda (Storefront) Link */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Moja Ponuda' : 'My Offer'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' 
                ? 'Podeli link svoje ponude na društvenim mrežama (do 10 proizvoda besplatno)'
                : 'Share your offer link on social media (up to 10 products free)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={shopLink}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(shopLink);
                  toast.success(language === 'sr' ? 'Link kopiran!' : 'Link copied!');
                }}
                className="primary-gradient"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(shopLink, '_blank')}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Storefront Products Management */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-zinc-400 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  {language === 'sr' ? 'Proizvodi u ponudi' : 'Products in offer'}
                </p>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {shopProducts.length}/10
                </Badge>
              </div>
              
              {loadingShopProducts ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : shopProducts.length === 0 ? (
                <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <Package className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">
                    {language === 'sr' 
                      ? 'Nema proizvoda u ponudi. Dodaj ih na stranici Proizvodi.'
                      : 'No products in offer. Add them on Products page.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shopProducts.map(product => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <Package className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{product.name}</p>
                        <p className="text-sm text-primary">{new Intl.NumberFormat('sr-RS').format(product.price)} RSD</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFromShop(product.id)}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        title={language === 'sr' ? 'Ukloni iz ponude' : 'Remove from offer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shop Description */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                {language === 'sr' ? 'Opis prodavnice' : 'Shop Description'}
              </p>
              <div className="flex gap-2">
                <Input
                  value={shopDescription}
                  onChange={e => setShopDescription(e.target.value)}
                  placeholder={language === 'sr' ? 'Npr. Najbolji ručno pravljeni nakit...' : 'E.g. Best handmade jewelry...'}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  maxLength={500}
                />
                <Button onClick={saveShopDescription} className="primary-gradient px-4">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {language === 'sr' ? 'Prikazuje se na vrhu tvog kataloga' : 'Shown at the top of your catalog'}
              </p>
            </div>

            {/* Theme Picker */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                {language === 'sr' ? 'Tema kataloga' : 'Catalog Theme'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(themeDisplayInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => saveShopTheme(key)}
                    disabled={savingTheme}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      currentTheme === key 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                    }`}
                  >
                    {currentTheme === key && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Mini preview */}
                    <div className="flex gap-1 mb-2">
                      <div className={`w-8 h-8 rounded-md ${info.preview[0]} border border-zinc-600/30`} />
                      <div className={`w-8 h-8 rounded-md ${info.preview[1]}`} />
                      <div className={`w-8 h-8 rounded-md ${info.preview[2]} border border-zinc-600/30`} />
                    </div>
                    <p className="font-medium text-white text-sm">{info.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{info.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card className="animate-fade-in bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Gift className="w-5 h-5 text-purple-400" />
              {language === 'sr' ? 'Pozovi Prijatelja' : 'Refer a Friend'}
            </CardTitle>
            <CardDescription className="text-zinc-300">
              {language === 'sr' 
                ? 'Oba dobijate mesec dana PRO besplatno!'
                : 'Both of you get one month PRO free!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-purple-500/20">
              <p className="text-sm text-zinc-400 mb-2">
                {language === 'sr' ? 'Tvoj referral link:' : 'Your referral link:'}
              </p>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/register?ref=${user?.referral_code || ''}`}
                  readOnly
                  className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
                />
                <Button 
                  onClick={copyReferralCode}
                  className={referralCopied ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600'}
                >
                  {referralCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  {language === 'sr' ? 'Pozvao si' : 'You invited'}
                </p>
                <p className="text-2xl font-bold text-white">{user?.referral_count || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">
                  {language === 'sr' ? 'Uštedeo si' : 'You saved'}
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {((user?.referral_count || 0) * 13.99).toFixed(2)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Podrazumevano Vreme Dostave' : 'Default Delivery Time'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' 
                ? 'Ovo vreme će se prikazati kupcima (možeš promeniti za svaku porudžbinu posebno)'
                : 'This time will be shown to customers (you can change it for each order)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input 
                type="number"
                min="1"
                max="30"
                defaultValue={user?.default_delivery_days || 3}
                className="w-24 bg-zinc-800 border-zinc-700 text-white"
                onBlur={async (e) => {
                  const days = parseInt(e.target.value);
                  if (days >= 1 && days <= 30) {
                    try {
                      await axios.put(`${API_URL}/auth/profile`, { default_delivery_days: days });
                    } catch (err) {
                      console.error('Failed to save delivery days:', err);
                    }
                  }
                }}
              />
              <span className="text-zinc-400">
                {language === 'sr' ? 'radnih dana' : 'business days'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-primary" />
              {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={language === 'sr' ? 'default' : 'outline'}
                onClick={() => setLanguage('sr')}
                className={language === 'sr' ? 'primary-gradient text-white' : 'border-zinc-700 text-white hover:bg-zinc-800'}
                data-testid="lang-sr-btn"
              >
                🇷🇸 {t('serbian')}
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'primary-gradient text-white' : 'border-zinc-700 text-white hover:bg-zinc-800'}
                data-testid="lang-en-btn"
              >
                🇬🇧 {t('english')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PRO Plan Banner */}
        <div className="premium-card-glow rounded-2xl p-[1px] animate-fade-in">
          <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                    PRO Plan
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      {language === 'sr' ? 'Uštedi 70%' : 'Save 70%'}
                    </Badge>
                  </h2>
                  <p className="text-zinc-400 mt-1">
                    {language === 'sr' 
                      ? 'Sve premium funkcije na jednom mestu' 
                      : 'All premium features in one place'}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-3xl font-bold text-white">{proPrice}€</span>
                    <span className="text-zinc-500 line-through">{regularPrice}€</span>
                    <span className="text-sm text-zinc-400">/ {language === 'sr' ? 'mesečno' : 'month'}</span>
                  </div>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-8 h-12"
                data-testid="activate-pro-btn"
              >
                <Zap className="w-5 h-5 mr-2" />
                {language === 'sr' ? 'Aktiviraj PRO' : 'Activate PRO'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800">
              {premiumFeatures.slice(0, 8).map(f => (
                <div key={f.key} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500" />
                  {f.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-heading text-white">
              {language === 'sr' ? 'Premium Funkcije' : 'Premium Features'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const hasAccess = hasFeatureAccess(feature.key);
              
              return (
                <div
                  key={feature.key}
                  className={`premium-card group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${hasAccess ? 'ring-2 ring-green-500/50' : ''}`}
                  onClick={() => openFeatureModal(feature)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`premium-card-${feature.key}`}
                >
                  {!hasAccess && (
                    <div className="sparkle-container">
                      <div className="sparkle sparkle-1"></div>
                      <div className="sparkle sparkle-2"></div>
                      <div className="sparkle sparkle-3"></div>
                      <div className="sparkle sparkle-4"></div>
                      <div className="sparkle sparkle-5"></div>
                    </div>
                  )}
                  
                  <div className="relative z-10 p-5 bg-zinc-900/90 backdrop-blur h-full">
                    <div className="absolute top-4 right-4">
                      {hasAccess ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          {language === 'sr' ? 'Aktivno' : 'Active'}
                        </Badge>
                      ) : (
                        <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0`}>
                          {feature.price}€
                        </Badge>
                      )}
                    </div>

                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{feature.shortDesc}</p>

                    {feature.hasFreeVersion && !hasAccess && (
                      <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {feature.freeVersionDesc}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-primary group-hover:text-white transition-colors">
                      {language === 'sr' ? 'Saznaj više' : 'Learn more'}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Detail Modal */}
        <Dialog open={featureModalOpen} onOpenChange={setFeatureModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
            {selectedFeature && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedFeature.color} flex items-center justify-center`}>
                      <selectedFeature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-heading text-white">
                        {selectedFeature.title}
                      </DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        {selectedFeature.shortDesc}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <p className="text-zinc-300">{selectedFeature.fullDesc}</p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{selectedFeature.problem}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-400">{selectedFeature.solution}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      {language === 'sr' ? 'Šta dobijaš' : 'What you get'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFeature.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {language === 'sr' ? 'Pro saveti' : 'Pro tips'}
                    </h4>
                    <ul className="space-y-2">
                      {selectedFeature.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">
                          {language === 'sr' ? 'Cena' : 'Price'}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {selectedFeature.price}€ 
                          <span className="text-sm font-normal text-zinc-400">/ {language === 'sr' ? 'mesečno' : 'month'}</span>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => setFeatureModalOpen(false)}
                        >
                          {language === 'sr' ? 'Zatvori' : 'Close'}
                        </Button>
                        <Button 
                          className={`bg-gradient-to-r ${selectedFeature.color} hover:opacity-90 text-white`}
                          data-testid={`activate-${selectedFeature.key}`}
                        >
                          {language === 'sr' ? 'Aktiviraj' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <Crown className="w-4 h-4" />
                        {language === 'sr' 
                          ? `Ili aktiviraj PRO plan i uštedi - sve za ${proPrice}€/mesečno`
                          : `Or activate PRO plan and save - everything for ${proPrice}€/month`}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Why PRO Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Zašto PRO?' : 'Why PRO?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <PieChart className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="font-semibold text-white mb-1">
                  {language === 'sr' ? 'Donosi pametnije odluke' : 'Make smarter decisions'}
                </h4>
                <p className="text-sm text-zinc-400">
                  {language === 'sr' 
                    ? 'Podaci ti pokazuju šta radi, a šta ne. Prestani da nagađaš.'
                    : 'Data shows you what works and what doesn\'t. Stop guessing.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <FileSpreadsheet className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="font-semibold text-white mb-1">
                  {language === 'sr' ? 'Uštedi vreme' : 'Save time'}
                </h4>
                <p className="text-sm text-zinc-400">
                  {language === 'sr' 
                    ? 'Automatski izveštaji umesto ručnog vođenja u Excel-u.'
                    : 'Automatic reports instead of manual Excel tracking.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <Send className="w-8 h-8 text-red-400 mb-3" />
                <h4 className="font-semibold text-white mb-1">
                  {language === 'sr' ? 'Povećaj prodaju' : 'Increase sales'}
                </h4>
                <p className="text-sm text-zinc-400">
                  {language === 'sr' 
                    ? 'Direktan kontakt sa kupcima koji žele da čuju od tebe.'
                    : 'Direct contact with customers who want to hear from you.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Celebration Modal */}
      {celebrationBadge && (
        <BadgeCelebration 
          badge={celebrationBadge}
          language={language}
          onClose={handleBadgeCelebrationClose}
        />
      )}
    </Layout>
  );
}
