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
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
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
  Trophy,
  Instagram,
  MessageCircle,
  Phone,
  PauseCircle,
  Share2,
  Flame,
  AlertTriangle,
  Loader2,
  Lock,
  KeyRound,
  Pencil,
  LayoutGrid,
  Rows3,
  Grid2x2,
  Newspaper,
  Type,
  MousePointer,
  Columns3,
  AlignLeft,
  AlignCenter,
  RectangleHorizontal,
  Megaphone,
  Info,
  SlidersHorizontal,
  Truck,
  CreditCard
} from 'lucide-react';
import BadgeCelebration from '../components/BadgeCelebration';
import { QRCodeCanvas } from 'qrcode.react';
import { themes } from './MiniShopPage';
import '../styles/premium.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [settingsTab, setSettingsTab] = useState('profile');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);
  const [loadingShopProducts, setLoadingShopProducts] = useState(true);
  const [celebrationBadge, setCelebrationBadge] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(user?.shop_theme || 'elegance');
  const [currentLayout, setCurrentLayout] = useState(user?.shop_layout || 'classic');
  const [shopDescription, setShopDescription] = useState(user?.shop_description || '');
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);

  // Seller feature states
  const [shopInstagram, setShopInstagram] = useState(user?.shop_instagram || '');
  const [shopWhatsapp, setShopWhatsapp] = useState(user?.shop_whatsapp || '');
  const [shopViber, setShopViber] = useState(user?.shop_viber || '');
  const [showLowStock, setShowLowStock] = useState(user?.shop_show_low_stock ?? false);
  const [showShare, setShowShare] = useState(user?.shop_show_share ?? false);
  const [quickOrder, setQuickOrder] = useState(user?.shop_quick_order ?? false);
  const [vacationMode, setVacationMode] = useState(user?.shop_vacation_mode ?? false);
  const [vacationMessage, setVacationMessage] = useState(user?.shop_vacation_message || '');
  const [savingFeature, setSavingFeature] = useState(null);

  // Shop customizer states
  const [shopAnnouncement, setShopAnnouncement] = useState(user?.shop_announcement || '');
  const [shopAnnouncementBg, setShopAnnouncementBg] = useState(user?.shop_announcement_bg || 'default');
  const [shopFont, setShopFont] = useState(user?.shop_font || 'modern');
  const [shopButtonStyle, setShopButtonStyle] = useState(user?.shop_button_style || 'rounded');
  const [shopCardStyle, setShopCardStyle] = useState(user?.shop_card_style || 'shadow');
  const [shopHeaderStyle, setShopHeaderStyle] = useState(user?.shop_header_style || 'left');
  const [shopProductsPerRow, setShopProductsPerRow] = useState(user?.shop_products_per_row || 4);
  const [showProductDescription, setShowProductDescription] = useState(user?.shop_show_product_description ?? true);
  const [shopAboutText, setShopAboutText] = useState(user?.shop_about_text || '');
  const [shopFooterText, setShopFooterText] = useState(user?.shop_footer_text || '');
  const [shopHeroStyle, setShopHeroStyle] = useState(user?.shop_hero_style || 'banner');
  const [savingCustomizer, setSavingCustomizer] = useState(false);

  // Account management states
  const [editingField, setEditingField] = useState(null); // 'password' | 'email' | 'name'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newBusinessName, setNewBusinessName] = useState(user?.business_name || '');
  const [accountSaving, setAccountSaving] = useState(false);

  // Verify PayPal subscription when returning from PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      const planFromUrl = params.get('plan') || '';
      const verifySubscription = async () => {
        setPaypalLoading(true);
        try {
          const res = await axios.post(`${API_URL}/payments/paypal/verify-subscription`);
          if (res.data.status === 'ACTIVE') {
            const planLabel = res.data.plan === 'biznis' ? 'Biznis' : 'Rast';
            toast.success(language === 'sr' ? `${planLabel} plan aktiviran! 🎉` : `${planLabel} plan activated! 🎉`);
            await refreshUser();
          } else {
            toast.info(language === 'sr' ? 'Pretplata još nije aktivna. Pokušaj ponovo za minut.' : 'Subscription not active yet. Try again in a minute.');
          }
        } catch {
          toast.error(language === 'sr' ? 'Greška pri verifikaciji pretplate' : 'Subscription verification error');
        } finally {
          setPaypalLoading(false);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      };
      verifySubscription();
    } else if (params.get('subscription') === 'cancelled') {
      toast.info(language === 'sr' ? 'Pretplata otkazana.' : 'Subscription cancelled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const proPrice = '9.99';
  const regularPrice = '45.93';
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // 'rast' or 'biznis'

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
    const previousTheme = currentTheme;
    setCurrentTheme(themeKey);
    setSavingTheme(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, { shop_theme: themeKey });
      toast.success(language === 'sr' ? 'Tema sačuvana!' : 'Theme saved!');
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('Error saving theme:', error);
      setCurrentTheme(previousTheme);
      toast.error(language === 'sr' ? 'Greška pri čuvanju teme' : 'Error saving theme');
    } finally {
      setSavingTheme(false);
    }
  };

  const saveShopLayout = async (layoutKey) => {
    const previousLayout = currentLayout;
    setCurrentLayout(layoutKey);
    setSavingLayout(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, { shop_layout: layoutKey });
      toast.success(language === 'sr' ? 'Dizajn sačuvan!' : 'Layout saved!');
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('Error saving layout:', error);
      setCurrentLayout(previousLayout);
      toast.error(language === 'sr' ? 'Greška pri čuvanju dizajna' : 'Error saving layout');
    } finally {
      setSavingLayout(false);
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

  const saveFeatureToggle = async (field, value) => {
    setSavingFeature(field);
    try {
      await axios.put(`${API_URL}/auth/profile`, { [field]: value });
      toast.success(language === 'sr' ? 'Sačuvano!' : 'Saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error(language === 'sr' ? 'Greška' : 'Error');
    } finally {
      setSavingFeature(null);
    }
  };

  const saveCustomizerField = async (field, value) => {
    setSavingCustomizer(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, { [field]: value });
      toast.success(language === 'sr' ? 'Sačuvano!' : 'Saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving customizer field:', error);
      toast.error(language === 'sr' ? 'Greška' : 'Error');
    } finally {
      setSavingCustomizer(false);
    }
  };

  const saveAllCustomizer = async () => {
    setSavingCustomizer(true);
    try {
      await axios.put(`${API_URL}/auth/profile`, {
        shop_announcement: shopAnnouncement,
        shop_announcement_bg: shopAnnouncementBg,
        shop_font: shopFont,
        shop_button_style: shopButtonStyle,
        shop_card_style: shopCardStyle,
        shop_header_style: shopHeaderStyle,
        shop_products_per_row: shopProductsPerRow,
        shop_show_product_description: showProductDescription,
        shop_about_text: shopAboutText,
        shop_footer_text: shopFooterText,
        shop_hero_style: shopHeroStyle,
      });
      toast.success(language === 'sr' ? 'Podešavanja sačuvana!' : 'Settings saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving customizer:', error);
      toast.error(language === 'sr' ? 'Greška pri čuvanju' : 'Error saving');
    } finally {
      setSavingCustomizer(false);
    }
  };

  const saveSocialLinks = async () => {
    setSavingFeature('social');
    try {
      await axios.put(`${API_URL}/auth/profile`, {
        shop_instagram: shopInstagram || '',
        shop_whatsapp: shopWhatsapp || '',
        shop_viber: shopViber || '',
      });
      toast.success(language === 'sr' ? 'Kontakti sačuvani!' : 'Contacts saved!');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error(language === 'sr' ? 'Greška' : 'Error');
    } finally {
      setSavingFeature(null);
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
    cherry: {
      label: 'Cherry',
      desc: language === 'sr' ? 'Romantik roze-crveni tonovi' : 'Romantic pink-red tones',
      preview: ['bg-rose-50', 'bg-rose-600', 'bg-rose-100']
    },
    lavender: {
      label: 'Lavender',
      desc: language === 'sr' ? 'Nežni ljubičasti tonovi' : 'Soft purple tones',
      preview: ['bg-purple-50', 'bg-gradient-to-r from-purple-500 to-violet-600', 'bg-purple-100']
    },
    gold: {
      label: 'Gold',
      desc: language === 'sr' ? 'Luksuzni zlatni tonovi' : 'Luxurious gold tones',
      preview: ['bg-amber-50', 'bg-gradient-to-r from-amber-500 to-yellow-500', 'bg-amber-100']
    },
    arctic: {
      label: 'Arctic',
      desc: language === 'sr' ? 'Tamna tema sa ledeno plavim akcentom' : 'Dark theme with icy blue accent',
      preview: ['bg-sky-950', 'bg-sky-500', 'bg-sky-800']
    },
    coffee: {
      label: 'Coffee',
      desc: language === 'sr' ? 'Tamna topla braon tema' : 'Dark warm brown theme',
      preview: ['bg-amber-950', 'bg-amber-600', 'bg-amber-800']
    },
    neon: {
      label: 'Neon',
      desc: language === 'sr' ? 'Tamna tema sa neonsko zelenim akcentom' : 'Dark theme with neon green accent',
      preview: ['bg-gray-950', 'bg-gradient-to-r from-lime-500 to-green-500', 'bg-gray-800']
    },
  };

  const layoutDisplayInfo = {
    classic: {
      label: 'Classic',
      desc: language === 'sr' ? 'Standardna mreža - 4 proizvoda u redu' : 'Standard grid - 4 products per row',
      icon: Grid2x2,
      preview: (
        <div className="grid grid-cols-4 gap-0.5 w-full">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-zinc-600 rounded-[2px]" />)}
        </div>
      ),
    },
    modern: {
      label: 'Modern',
      desc: language === 'sr' ? 'Veće kartice sa više detalja - 2 u redu' : 'Larger cards with more details - 2 per row',
      icon: LayoutGrid,
      preview: (
        <div className="grid grid-cols-2 gap-0.5 w-full">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-zinc-600 rounded-[2px]" />)}
        </div>
      ),
    },
    list: {
      label: 'List',
      desc: language === 'sr' ? 'Horizontalne kartice - slika levo, detalji desno' : 'Horizontal cards - image left, details right',
      icon: Rows3,
      preview: (
        <div className="flex flex-col gap-0.5 w-full">
          {[...Array(4)].map((_, i) => <div key={i} className="flex gap-0.5"><div className="w-5 h-3 bg-zinc-600 rounded-[2px] flex-shrink-0" /><div className="flex-1 h-3 bg-zinc-700 rounded-[2px]" /></div>)}
        </div>
      ),
    },
    magazine: {
      label: 'Magazine',
      desc: language === 'sr' ? 'Prvi proizvod istaknut, ostali u mreži' : 'First product featured, rest in grid',
      icon: Newspaper,
      preview: (
        <div className="flex flex-col gap-0.5 w-full">
          <div className="aspect-[2/1] bg-zinc-600 rounded-[2px]" />
          <div className="grid grid-cols-3 gap-0.5">
            {[...Array(3)].map((_, i) => <div key={i} className="aspect-square bg-zinc-600 rounded-[2px]" />)}
          </div>
        </div>
      ),
    },
    boutique: {
      label: 'Boutique',
      desc: language === 'sr' ? 'Luksuzni dizajn sa istaknutim proizvodom' : 'Luxury design with featured product',
      icon: LayoutGrid,
      preview: (
        <div className="flex flex-col gap-0.5 w-full">
          <div className="text-center text-[6px] text-zinc-500 mb-0.5">★ ★ ★</div>
          <div className="grid grid-cols-2 gap-0.5">
            <div className="aspect-[3/4] bg-zinc-600 rounded-[2px] col-span-2" />
            {[...Array(2)].map((_, i) => <div key={i} className="aspect-[3/4] bg-zinc-600 rounded-[2px]" />)}
          </div>
        </div>
      ),
    },
    showcase: {
      label: 'Showcase',
      desc: language === 'sr' ? 'Galerija - slike proizvoda u fokusu' : 'Gallery - product images in focus',
      icon: Grid2x2,
      preview: (
        <div className="columns-2 gap-0.5 w-full">
          <div className="aspect-[3/4] bg-zinc-600 rounded-[2px] mb-0.5" />
          <div className="aspect-square bg-zinc-600 rounded-[2px] mb-0.5" />
          <div className="aspect-square bg-zinc-600 rounded-[2px] mb-0.5" />
          <div className="aspect-[3/4] bg-zinc-600 rounded-[2px] mb-0.5" />
        </div>
      ),
    },
    storefront: {
      label: 'Storefront',
      desc: language === 'sr' ? 'Profesionalna e-commerce prodavnica' : 'Professional e-commerce store',
      icon: Rows3,
      preview: (
        <div className="flex flex-col gap-0.5 w-full">
          <div className="h-2 bg-zinc-600 rounded-[2px]" />
          <div className="h-1.5 bg-zinc-700 rounded-[2px]" />
          <div className="grid grid-cols-5 gap-0.5">
            {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-zinc-600 rounded-[2px]" />)}
          </div>
        </div>
      ),
    },
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl" data-testid="settings-page">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-heading text-white">{t('settings')}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="animate-fade-in flex gap-2 flex-wrap">
          {[
            { id: 'profile', icon: Building2, label: language === 'sr' ? 'Profil' : 'Profile' },
            { id: 'shop', icon: ShoppingBag, label: language === 'sr' ? 'Prodavnica' : 'Shop' },
            { id: 'design', icon: Palette, label: language === 'sr' ? 'Dizajn' : 'Design' },
            { id: 'delivery', icon: Truck, label: language === 'sr' ? 'Kuponi & Dostava' : 'Coupons & Delivery' },
            { id: 'plan', icon: CreditCard, label: language === 'sr' ? 'Plan' : 'Plan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                settingsTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== PROFILE TAB ========== */}
        {settingsTab === 'profile' && (<>

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

        {/* Account Management */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <KeyRound className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Upravljanje nalogom' : 'Account Management'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' ? 'Promeni lozinku, email ili ime biznisa' : 'Change password, email or business name'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Business Name */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Ime biznisa' : 'Business Name'}</p>
                    <p className="text-xs text-zinc-500">{user?.business_name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => {
                    setEditingField(editingField === 'name' ? null : 'name');
                    setNewBusinessName(user?.business_name || '');
                  }}
                >
                  {editingField === 'name' ? (language === 'sr' ? 'Otkaži' : 'Cancel') : (language === 'sr' ? 'Promeni' : 'Change')}
                </Button>
              </div>
              {editingField === 'name' && (
                <div className="mt-3 space-y-3">
                  <Input
                    placeholder={language === 'sr' ? 'Novo ime biznisa' : 'New business name'}
                    value={newBusinessName}
                    onChange={e => setNewBusinessName(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <Button
                    size="sm" className="primary-gradient"
                    disabled={accountSaving || !newBusinessName.trim()}
                    onClick={async () => {
                      setAccountSaving(true);
                      try {
                        await axios.post(`${API_URL}/auth/change-business-name`, { business_name: newBusinessName });
                        toast.success(language === 'sr' ? 'Ime promenjeno!' : 'Name changed!');
                        await refreshUser();
                        setEditingField(null);
                      } catch (err) {
                        toast.error(err.response?.data?.detail || 'Error');
                      } finally { setAccountSaving(false); }
                    }}
                  >
                    {accountSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'sr' ? 'Sačuvaj' : 'Save')}
                  </Button>
                </div>
              )}
            </div>

            {/* Change Email */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => {
                    setEditingField(editingField === 'email' ? null : 'email');
                    setNewEmail(''); setEmailPassword('');
                  }}
                >
                  {editingField === 'email' ? (language === 'sr' ? 'Otkaži' : 'Cancel') : (language === 'sr' ? 'Promeni' : 'Change')}
                </Button>
              </div>
              {editingField === 'email' && (
                <div className="mt-3 space-y-3">
                  <Input
                    type="email"
                    placeholder={language === 'sr' ? 'Novi email' : 'New email'}
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <Input
                    type="password"
                    placeholder={language === 'sr' ? 'Trenutna lozinka (potvrda)' : 'Current password (confirm)'}
                    value={emailPassword}
                    onChange={e => setEmailPassword(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <Button
                    size="sm" className="primary-gradient"
                    disabled={accountSaving || !newEmail || !emailPassword}
                    onClick={async () => {
                      setAccountSaving(true);
                      try {
                        await axios.post(`${API_URL}/auth/change-email`, { new_email: newEmail, password: emailPassword });
                        toast.success(language === 'sr' ? 'Email promenjen!' : 'Email changed!');
                        await refreshUser();
                        setEditingField(null);
                      } catch (err) {
                        toast.error(err.response?.data?.detail || 'Error');
                      } finally { setAccountSaving(false); }
                    }}
                  >
                    {accountSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'sr' ? 'Sačuvaj' : 'Save')}
                  </Button>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Lozinka' : 'Password'}</p>
                    <p className="text-xs text-zinc-500">••••••••</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => {
                    setEditingField(editingField === 'password' ? null : 'password');
                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                  }}
                >
                  {editingField === 'password' ? (language === 'sr' ? 'Otkaži' : 'Cancel') : (language === 'sr' ? 'Promeni' : 'Change')}
                </Button>
              </div>
              {editingField === 'password' && (
                <div className="mt-3 space-y-3">
                  <Input
                    type="password"
                    placeholder={language === 'sr' ? 'Trenutna lozinka' : 'Current password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <Input
                    type="password"
                    placeholder={language === 'sr' ? 'Nova lozinka' : 'New password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <Input
                    type="password"
                    placeholder={language === 'sr' ? 'Potvrdi novu lozinku' : 'Confirm new password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400">{language === 'sr' ? 'Lozinke se ne poklapaju' : 'Passwords do not match'}</p>
                  )}
                  <Button
                    size="sm" className="primary-gradient"
                    disabled={accountSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                    onClick={async () => {
                      setAccountSaving(true);
                      try {
                        await axios.post(`${API_URL}/auth/change-password`, { current_password: currentPassword, new_password: newPassword });
                        toast.success(language === 'sr' ? 'Lozinka promenjena!' : 'Password changed!');
                        setEditingField(null);
                      } catch (err) {
                        toast.error(err.response?.data?.detail || 'Error');
                      } finally { setAccountSaving(false); }
                    }}
                  >
                    {accountSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'sr' ? 'Sačuvaj' : 'Save')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        </>)}

        {/* ========== SHOP TAB ========== */}
        {settingsTab === 'shop' && (<>

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

            {/* QR Code */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-zinc-400 flex items-center gap-2">
                  {language === 'sr' ? '📱 QR kod za prodavnicu' : '📱 Shop QR Code'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 hover:bg-zinc-800 text-xs"
                  onClick={() => {
                    const canvas = document.querySelector('#qr-code-canvas canvas');
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'narucify-qr-code.png';
                      a.click();
                      toast.success(language === 'sr' ? 'QR kod preuzet!' : 'QR code downloaded!');
                    }
                  }}
                >
                  {language === 'sr' ? 'Preuzmi' : 'Download'}
                </Button>
              </div>
              <div id="qr-code-canvas" className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeCanvas value={shopLink} size={180} level="H" includeMargin={true} />
              </div>
              <p className="text-xs text-zinc-500 text-center mt-2">
                {language === 'sr' ? 'Skeniraj da otvoriš prodavnicu' : 'Scan to open shop'}
              </p>
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
                {language === 'sr' ? 'Prikazuje se na vrhu tvoje prodavnice' : 'Shown at the top of your shop'}
              </p>
            </div>
          </CardContent>
        </Card>
        </>)}

        {/* ========== DESIGN TAB ========== */}
        {settingsTab === 'design' && (<>
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Palette className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Dizajn prodavnice' : 'Shop Design'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' ? 'Tema, raspored i prilagođavanje izgleda' : 'Theme, layout and appearance customization'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Theme Picker */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                {language === 'sr' ? 'Tema prodavnice' : 'Shop Theme'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(themeDisplayInfo).map(([key, info]) => {
                  const themeAllowed = !user?.plan_limits?.themes || user.plan_limits.themes.includes(key);
                  return (
                  <button
                    key={key}
                    onClick={() => themeAllowed ? saveShopTheme(key) : toast.error(language === 'sr' ? `Tema "${info.label}" zahteva viši plan` : `Theme "${info.label}" requires a higher plan`)}
                    disabled={savingTheme}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      currentTheme === key 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : themeAllowed
                          ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                          : 'border-zinc-800 bg-zinc-900/50 opacity-50'
                    }`}
                  >
                    {!themeAllowed && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-zinc-400" />
                      </div>
                    )}
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
                  );
                })}
              </div>
            </div>

            {/* Layout Picker */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-1">
                <LayoutGrid className="w-4 h-4" />
                {language === 'sr' ? 'Dizajn prodavnice' : 'Shop Layout'}
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                {language === 'sr' ? 'Izaberi kako se proizvodi prikazuju kupcima' : 'Choose how products are displayed to customers'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(layoutDisplayInfo).map(([key, info]) => {
                  const Icon = info.icon;
                  const layoutAllowed = !user?.plan_limits?.layouts || user.plan_limits.layouts.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => layoutAllowed ? saveShopLayout(key) : toast.error(language === 'sr' ? `Šablon "${info.label}" zahteva Biznis plan` : `Layout "${info.label}" requires Biznis plan`)}
                      disabled={savingLayout}
                      className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                        currentLayout === key 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : layoutAllowed
                            ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                            : 'border-zinc-800 bg-zinc-900/50 opacity-50'
                      }`}
                    >
                      {!layoutAllowed && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-zinc-400" />
                        </div>
                      )}
                      {currentLayout === key && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="mb-2 p-2 rounded-lg bg-zinc-800 w-full aspect-square flex items-center justify-center">
                        {info.preview}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <p className="font-medium text-white text-sm">{info.label}</p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{info.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========== SHOP CUSTOMIZER ========== */}
            <div className={`pt-4 border-t border-zinc-800 ${!user?.plan_limits?.customizer ? 'relative' : ''}`}>
              {!user?.plan_limits?.customizer && (
                <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm font-medium">{language === 'sr' ? 'Shop Customizer zahteva Rast ili Biznis plan' : 'Shop Customizer requires Rast or Biznis plan'}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-1">
                <SlidersHorizontal className="w-4 h-4" />
                {language === 'sr' ? 'Napredna podešavanja prodavnice' : 'Advanced Shop Customizer'}
              </p>
              <p className="text-xs text-zinc-500 mb-4">
                {language === 'sr' ? 'Prilagodi svaki detalj prodavnice kao u Shopify-ju' : 'Customize every detail of your shop like in Shopify'}
              </p>

              <div className="space-y-5">
                {/* Announcement Bar */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Traka za obaveštenja' : 'Announcement Bar'}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{language === 'sr' ? 'Prikazuje se na vrhu prodavnice (npr. "Besplatna dostava!", "Rasprodaja -30%!")' : 'Displayed at the top of your shop (e.g. "Free shipping!", "Sale -30%!")'}</p>
                  <Input
                    value={shopAnnouncement}
                    onChange={e => setShopAnnouncement(e.target.value)}
                    placeholder={language === 'sr' ? 'Npr. Besplatna dostava preko 2000 RSD!' : 'E.g. Free shipping over $50!'}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    maxLength={200}
                  />
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">{language === 'sr' ? 'Boja trake' : 'Bar color'}</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { val: 'default', label: language === 'sr' ? 'Podrazumevana' : 'Default', color: 'bg-zinc-700' },
                        { val: 'red', label: language === 'sr' ? 'Crvena' : 'Red', color: 'bg-red-600' },
                        { val: 'green', label: language === 'sr' ? 'Zelena' : 'Green', color: 'bg-emerald-600' },
                        { val: 'blue', label: language === 'sr' ? 'Plava' : 'Blue', color: 'bg-blue-600' },
                        { val: 'yellow', label: language === 'sr' ? 'Žuta' : 'Yellow', color: 'bg-amber-500' },
                        { val: 'black', label: language === 'sr' ? 'Crna' : 'Black', color: 'bg-zinc-900 border border-zinc-600' },
                        { val: 'purple', label: language === 'sr' ? 'Ljubičasta' : 'Purple', color: 'bg-purple-600' },
                      ].map(opt => (
                        <button key={opt.val} onClick={() => setShopAnnouncementBg(opt.val)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${shopAnnouncementBg === opt.val ? 'ring-2 ring-primary ring-offset-1 ring-offset-zinc-900' : 'opacity-70 hover:opacity-100'}`}>
                          <span className={`w-3 h-3 rounded-full ${opt.color}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Selection */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Font prodavnice' : 'Shop Font'}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {[
                      { val: 'modern', label: 'Modern', family: 'Inter', preview: 'Aa' },
                      { val: 'classic', label: 'Classic', family: 'Merriweather', preview: 'Aa' },
                      { val: 'elegant', label: 'Elegant', family: 'Playfair Display', preview: 'Aa' },
                      { val: 'playful', label: 'Playful', family: 'Nunito', preview: 'Aa' },
                      { val: 'mono', label: 'Mono', family: 'JetBrains Mono', preview: 'Aa' },
                    ].map(font => (
                      <button key={font.val} onClick={() => setShopFont(font.val)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${shopFont === font.val ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                        <p className="text-2xl text-white mb-1" style={{ fontFamily: font.family }}>{font.preview}</p>
                        <p className="text-xs text-zinc-400">{font.label}</p>
                        <p className="text-[10px] text-zinc-600">{font.family}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Style */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <RectangleHorizontal className="w-4 h-4 text-green-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Stil zaglavlja' : 'Hero Style'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'banner', label: language === 'sr' ? 'Baner' : 'Banner', desc: language === 'sr' ? 'Velika slika sa opisom' : 'Large image with description' },
                      { val: 'minimal', label: language === 'sr' ? 'Minimalan' : 'Minimal', desc: language === 'sr' ? 'Samo logo i ime' : 'Just logo and name' },
                      { val: 'none', label: language === 'sr' ? 'Bez zaglavlja' : 'No Hero', desc: language === 'sr' ? 'Direktno proizvodi' : 'Products directly' },
                    ].map(opt => (
                      <button key={opt.val} onClick={() => setShopHeroStyle(opt.val)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${shopHeroStyle === opt.val ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                        <p className="text-sm font-medium text-white">{opt.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Alignment */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlignCenter className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Poravnanje zaglavlja' : 'Header Alignment'}</p>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { val: 'left', label: language === 'sr' ? 'Levo' : 'Left', icon: AlignLeft },
                      { val: 'center', label: language === 'sr' ? 'Centar' : 'Center', icon: AlignCenter },
                      { val: 'full', label: language === 'sr' ? 'Puna širina' : 'Full Width', icon: Columns3 },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.val} onClick={() => setShopHeaderStyle(opt.val)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${shopHeaderStyle === opt.val ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                          <Icon className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
                          <p className="text-xs text-zinc-300">{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Button Style */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-pink-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Stil dugmadi' : 'Button Style'}</p>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { val: 'rounded', label: language === 'sr' ? 'Zaobljeno' : 'Rounded' },
                      { val: 'square', label: language === 'sr' ? 'Kvadratno' : 'Square' },
                      { val: 'pill', label: language === 'sr' ? 'Kapsulasto' : 'Pill' },
                    ].map(opt => (
                      <button key={opt.val} onClick={() => setShopButtonStyle(opt.val)}
                        className={`flex-1 transition-all border-2 ${shopButtonStyle === opt.val ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'} ${opt.val === 'rounded' ? 'rounded-lg' : opt.val === 'square' ? 'rounded-none' : 'rounded-full'} p-3 text-center`}>
                        <div className={`mx-auto w-16 h-6 bg-primary/30 mb-1.5 ${opt.val === 'rounded' ? 'rounded-md' : opt.val === 'square' ? 'rounded-none' : 'rounded-full'}`} />
                        <p className="text-xs text-zinc-300">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-cyan-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Stil kartica proizvoda' : 'Product Card Style'}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { val: 'shadow', label: language === 'sr' ? 'Senka' : 'Shadow', desc: language === 'sr' ? 'Meka senka' : 'Soft shadow' },
                      { val: 'border', label: language === 'sr' ? 'Okvir' : 'Border', desc: language === 'sr' ? 'Vidljiv okvir' : 'Visible border' },
                      { val: 'minimal', label: language === 'sr' ? 'Minimalan' : 'Minimal', desc: language === 'sr' ? 'Bez senke/okvira' : 'No shadow/border' },
                      { val: 'elevated', label: language === 'sr' ? 'Izdignuto' : 'Elevated', desc: language === 'sr' ? 'Jaka senka' : 'Strong shadow' },
                    ].map(opt => (
                      <button key={opt.val} onClick={() => setShopCardStyle(opt.val)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${shopCardStyle === opt.val ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                        <div className={`w-full h-8 rounded bg-zinc-700 mb-2 ${
                          opt.val === 'shadow' ? 'shadow-md' : 
                          opt.val === 'border' ? 'border-2 border-zinc-500' : 
                          opt.val === 'minimal' ? '' : 
                          'shadow-xl shadow-black/40'
                        }`} />
                        <p className="text-xs font-medium text-zinc-300">{opt.label}</p>
                        <p className="text-[10px] text-zinc-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Per Row */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Columns3 className="w-4 h-4 text-violet-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Proizvoda po redu' : 'Products Per Row'}</p>
                  </div>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(num => (
                      <button key={num} onClick={() => setShopProductsPerRow(num)}
                        className={`flex-1 p-2 rounded-lg border-2 transition-all text-center ${shopProductsPerRow === num ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                        <div className={`grid gap-0.5 mb-1.5 mx-auto w-12`} style={{ gridTemplateColumns: `repeat(${num}, 1fr)` }}>
                          {[...Array(num)].map((_, i) => <div key={i} className="aspect-square bg-zinc-600 rounded-[1px]" />)}
                        </div>
                        <p className="text-xs text-zinc-300 font-medium">{num}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Product Description Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Info className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{language === 'sr' ? 'Prikaži opis proizvoda' : 'Show product descriptions'}</p>
                      <p className="text-xs text-zinc-500">{language === 'sr' ? 'Opis se prikazuje na karticama u prodavnici' : 'Description shown on product cards in shop'}</p>
                    </div>
                  </div>
                  <Switch checked={showProductDescription} onCheckedChange={setShowProductDescription} />
                </div>

                {/* About Text */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-orange-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'O prodavnici (sekcija)' : 'About Section'}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{language === 'sr' ? 'Prikazuje se ispod proizvoda - ispričaj kupcima svoju priču' : 'Shown below products - tell customers your story'}</p>
                  <Textarea
                    value={shopAboutText}
                    onChange={e => setShopAboutText(e.target.value)}
                    placeholder={language === 'sr' ? 'Npr. Mi smo porodična firma koja pravi ručno rađene proizvode od 2015...' : 'E.g. We are a family business making handmade products since 2015...'}
                    className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                    maxLength={1000}
                  />
                </div>

                {/* Footer Text */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-white">{language === 'sr' ? 'Tekst u podnožju' : 'Footer Text'}</p>
                  </div>
                  <Input
                    value={shopFooterText}
                    onChange={e => setShopFooterText(e.target.value)}
                    placeholder={language === 'sr' ? 'Npr. © 2025 Moja Prodavnica. Sva prava zadržana.' : 'E.g. © 2025 My Shop. All rights reserved.'}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    maxLength={300}
                  />
                </div>

                {/* Save All Button */}
                <Button onClick={saveAllCustomizer} disabled={savingCustomizer} className="w-full primary-gradient">
                  {savingCustomizer ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <><Check className="w-4 h-4 mr-2" /> {language === 'sr' ? 'Sačuvaj sva podešavanja' : 'Save all settings'}</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </>)}

        {/* ========== SHOP TAB (continued) - Social & Features ========== */}
        {settingsTab === 'shop' && (<>

        {/* Social Contact Links */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white text-base">
              <MessageCircle className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Kontakt linkovi' : 'Contact Links'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' ? 'Kupci će moći da te kontaktiraju direktno sa prodavnice' : 'Customers can contact you directly from the shop'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    value={shopInstagram}
                    onChange={e => setShopInstagram(e.target.value)}
                    placeholder={language === 'sr' ? 'Instagram korisničko ime' : 'Instagram username'}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    maxLength={100}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    value={shopWhatsapp}
                    onChange={e => setShopWhatsapp(e.target.value)}
                    placeholder={language === 'sr' ? 'WhatsApp broj (npr. 381601234567)' : 'WhatsApp number (e.g. 381601234567)'}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    maxLength={30}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    value={shopViber}
                    onChange={e => setShopViber(e.target.value)}
                    placeholder={language === 'sr' ? 'Viber broj (npr. 381601234567)' : 'Viber number (e.g. 381601234567)'}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    maxLength={30}
                  />
                </div>
                <Button 
                  onClick={saveSocialLinks} 
                  className="primary-gradient px-6"
                  disabled={savingFeature === 'social'}
                >
                  {savingFeature === 'social' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <><Check className="w-4 h-4 mr-1" /> {language === 'sr' ? 'Sačuvaj kontakte' : 'Save contacts'}</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles Card */}
        <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-white text-base">
              <Zap className="w-5 h-5 text-primary" />
              {language === 'sr' ? 'Funkcije prodavnice' : 'Shop Features'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {language === 'sr' ? 'Uključi ili isključi dodatne opcije za svoju prodavnicu.' : 'Enable or disable additional options for your shop.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                {/* Low Stock Badge */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {language === 'sr' ? 'Oznaka "Poslednji komadi"' : '"Last items" badge'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {language === 'sr' ? 'Prikazuje se kad je zaliha ≤ 3' : 'Shows when stock ≤ 3'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={showLowStock}
                    onCheckedChange={(val) => {
                      setShowLowStock(val);
                      saveFeatureToggle('shop_show_low_stock', val);
                    }}
                    disabled={savingFeature === 'shop_show_low_stock'}
                  />
                </div>

                {/* Share Button */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {language === 'sr' ? 'Dugme za deljenje proizvoda' : 'Product share button'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {language === 'sr' ? 'Kupci mogu deliti proizvode' : 'Customers can share products'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={showShare}
                    onCheckedChange={(val) => {
                      setShowShare(val);
                      saveFeatureToggle('shop_show_share', val);
                    }}
                    disabled={savingFeature === 'shop_show_share'}
                  />
                </div>

                {/* Quick Order */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {language === 'sr' ? 'Brza narudžbina (1 klik)' : 'Quick order (1 click)'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {language === 'sr' ? '"Poruči odmah" dugme preskače korpu' : '"Order now" button skips cart'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={quickOrder}
                    onCheckedChange={(val) => {
                      setQuickOrder(val);
                      saveFeatureToggle('shop_quick_order', val);
                    }}
                    disabled={savingFeature === 'shop_quick_order'}
                  />
                </div>

                {/* Vacation Mode */}
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <PauseCircle className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {language === 'sr' ? 'Režim pauze (odmor)' : 'Vacation mode'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {language === 'sr' ? 'Prikazuje poruku da ne primaš narudžbine' : 'Shows a message that you are not taking orders'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={vacationMode}
                      onCheckedChange={(val) => {
                        setVacationMode(val);
                        saveFeatureToggle('shop_vacation_mode', val);
                      }}
                      disabled={savingFeature === 'shop_vacation_mode'}
                    />
                  </div>
                  {vacationMode && (
                    <div className="pl-11">
                      <Textarea
                        value={vacationMessage}
                        onChange={e => setVacationMessage(e.target.value)}
                        placeholder={language === 'sr' ? 'Npr. Vraćam se 15. januara!' : 'E.g. Back on January 15!'}
                        className="bg-zinc-900 border-zinc-700 text-white text-sm resize-none"
                        maxLength={300}
                        rows={2}
                      />
                      <Button 
                        size="sm" 
                        className="mt-2 primary-gradient"
                        onClick={() => saveFeatureToggle('shop_vacation_message', vacationMessage)}
                        disabled={savingFeature === 'shop_vacation_message'}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {language === 'sr' ? 'Sačuvaj poruku' : 'Save message'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </CardContent>
        </Card>

        </>)}

        {/* ========== DELIVERY TAB ========== */}
        {settingsTab === 'delivery' && (<>

        {/* Coupon Codes Management */}
        <CouponsSection language={language} />

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

        </>)}

        {/* ========== PLAN TAB ========== */}
        {settingsTab === 'plan' && (<>

        {/* Refer a Friend */}
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

        {/* Subscription Plans */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold font-heading text-white">
              {language === 'sr' ? 'Izaberi plan' : 'Choose a plan'}
            </h2>
          </div>
          {user?.trial_active && user?.plan === 'starter' && (
            <p className="text-amber-400 text-sm mb-4 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {language === 'sr' 
                ? `Starter probni period: još ${user.trial_days_left} dana` 
                : `Starter trial: ${user.trial_days_left} days left`}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Starter Plan */}
            <div className={`relative rounded-2xl border ${user?.plan === 'starter' ? 'border-zinc-500 ring-2 ring-zinc-500' : 'border-zinc-800'} bg-zinc-900 p-6 flex flex-col`}>
              {user?.plan === 'starter' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-zinc-600 text-white border-0 text-xs">{language === 'sr' ? 'Trenutni plan' : 'Current plan'}</Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-zinc-500 text-sm mt-1">{language === 'sr' ? 'Za početnike' : 'For beginners'}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">{language === 'sr' ? 'Besplatno' : 'Free'}</span>
              </div>
              <div className="flex-1 space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '15 proizvoda' : '15 products'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '10 u prodavnici' : '10 in shop'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '6 tema' : '6 themes'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '4 šablona' : '4 templates'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '21 dan probni period' : '21 day trial'}</div>
                <div className="flex items-center gap-2 text-zinc-500"><Lock className="w-4 h-4 shrink-0" />{language === 'sr' ? 'Vodeni žig na prodavnici' : 'Watermark on shop'}</div>
                <div className="flex items-center gap-2 text-zinc-500"><Lock className="w-4 h-4 shrink-0" />{language === 'sr' ? 'Bez customizera' : 'No customizer'}</div>
              </div>
              {user?.plan === 'starter' ? (
                <Button disabled className="w-full bg-zinc-700 text-zinc-400 cursor-default">
                  <Check className="w-4 h-4 mr-2" />{language === 'sr' ? 'Aktivan' : 'Active'}
                </Button>
              ) : (
                <Button disabled className="w-full border-zinc-700 text-zinc-500" variant="outline">
                  {language === 'sr' ? 'Osnovni plan' : 'Basic plan'}
                </Button>
              )}
            </div>

            {/* Rast Plan */}
            <div className={`relative rounded-2xl border ${user?.plan === 'rast' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-zinc-700'} bg-zinc-900 p-6 flex flex-col`}>
              {user?.plan === 'rast' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white border-0 text-xs">{language === 'sr' ? 'Trenutni plan' : 'Current plan'}</Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Rast
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">{language === 'sr' ? 'Popularan' : 'Popular'}</Badge>
                </h3>
                <p className="text-zinc-500 text-sm mt-1">{language === 'sr' ? 'Za rastuće biznise' : 'For growing businesses'}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">2.499</span>
                <span className="text-zinc-400 text-sm">RSD</span>
              </div>
              <p className="text-zinc-500 text-xs mb-4">≈ 21.99 EUR / {language === 'sr' ? 'mesečno' : 'month'}</p>
              <div className="flex-1 space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '50 proizvoda' : '50 products'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '50 u prodavnici' : '50 in shop'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '6 tema' : '6 themes'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? '4 šablona' : '4 templates'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-blue-400 shrink-0" />{language === 'sr' ? 'Shop Customizer' : 'Shop Customizer'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-blue-400 shrink-0" />{language === 'sr' ? 'Manji vodeni žig' : 'Small watermark'}</div>
                <div className="flex items-center gap-2 text-zinc-500"><Lock className="w-4 h-4 shrink-0" />{language === 'sr' ? 'Premium teme zaključane' : 'Premium themes locked'}</div>
              </div>
              {user?.plan === 'rast' ? (
                <div className="space-y-2">
                  <Button disabled className="w-full bg-blue-600 text-white cursor-default">
                    <Check className="w-4 h-4 mr-2" />{language === 'sr' ? 'Aktivan' : 'Active'}
                  </Button>
                  {user?.paypal_subscription_status === 'ACTIVE' && (
                    <Button
                      variant="outline" size="sm"
                      className="w-full text-red-400 border-red-400/30 hover:bg-red-500/10 text-xs"
                      disabled={paypalLoading}
                      onClick={async () => {
                        if (!window.confirm(language === 'sr' ? 'Otkazati pretplatu?' : 'Cancel subscription?')) return;
                        setPaypalLoading(true);
                        try {
                          await axios.post(`${API_URL}/payments/paypal/cancel-subscription`);
                          toast.success(language === 'sr' ? 'Pretplata otkazana.' : 'Subscription cancelled.');
                          await refreshUser();
                        } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
                        finally { setPaypalLoading(false); }
                      }}
                    >
                      {paypalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (language === 'sr' ? 'Otkaži pretplatu' : 'Cancel')}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={paypalLoading}
                  onClick={async () => {
                    setPaypalLoading(true);
                    try {
                      const res = await axios.post(`${API_URL}/payments/paypal/create-subscription`, { plan: 'rast' });
                      if (res.data.approve_url) { window.location.href = res.data.approve_url; }
                      else { toast.error(language === 'sr' ? 'PayPal nije konfigurisan' : 'PayPal not configured'); setPaypalLoading(false); }
                    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); setPaypalLoading(false); }
                  }}
                >
                  {paypalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  {user?.plan === 'biznis' 
                    ? (language === 'sr' ? 'Downgrade' : 'Downgrade') 
                    : (language === 'sr' ? 'Pretplati se' : 'Subscribe')}
                </Button>
              )}
            </div>

            {/* Biznis Plan */}
            <div className={`relative rounded-2xl border ${user?.plan === 'biznis' ? 'border-amber-500 ring-2 ring-amber-500' : 'border-amber-500/30'} bg-zinc-900 p-6 flex flex-col`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                {user?.plan === 'biznis' ? (
                  <Badge className="bg-amber-600 text-white border-0 text-xs">{language === 'sr' ? 'Trenutni plan' : 'Current plan'}</Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">{language === 'sr' ? 'Najbolja vrednost' : 'Best value'}</Badge>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Biznis
                  <Crown className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-zinc-500 text-sm mt-1">{language === 'sr' ? 'Za ozbiljne prodavce' : 'For serious sellers'}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">3.899</span>
                <span className="text-zinc-400 text-sm">RSD</span>
              </div>
              <p className="text-zinc-500 text-xs mb-4">≈ 33.99 EUR / {language === 'sr' ? 'mesečno' : 'month'}</p>
              <div className="flex-1 space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? 'Neograničeni proizvodi' : 'Unlimited products'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-green-500 shrink-0" />{language === 'sr' ? 'Neograničeni u prodavnici' : 'Unlimited in shop'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-amber-400 shrink-0" />{language === 'sr' ? 'Svih 12 tema' : 'All 12 themes'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-amber-400 shrink-0" />{language === 'sr' ? 'Svih 7 šablona' : 'All 7 templates'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-amber-400 shrink-0" />{language === 'sr' ? 'Potpuni customizer' : 'Full customizer'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-amber-400 shrink-0" />{language === 'sr' ? 'Bez vodenog žiga' : 'No watermark'}</div>
                <div className="flex items-center gap-2 text-zinc-300"><Check className="w-4 h-4 text-amber-400 shrink-0" />{language === 'sr' ? 'PRO badge na prodavnici' : 'PRO badge on shop'}</div>
              </div>
              {user?.plan === 'biznis' ? (
                <div className="space-y-2">
                  <Button disabled className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white cursor-default">
                    <Check className="w-4 h-4 mr-2" />{language === 'sr' ? 'Aktivan' : 'Active'}
                  </Button>
                  {user?.paypal_subscription_status === 'ACTIVE' && (
                    <Button
                      variant="outline" size="sm"
                      className="w-full text-red-400 border-red-400/30 hover:bg-red-500/10 text-xs"
                      disabled={paypalLoading}
                      onClick={async () => {
                        if (!window.confirm(language === 'sr' ? 'Otkazati pretplatu?' : 'Cancel subscription?')) return;
                        setPaypalLoading(true);
                        try {
                          await axios.post(`${API_URL}/payments/paypal/cancel-subscription`);
                          toast.success(language === 'sr' ? 'Pretplata otkazana.' : 'Subscription cancelled.');
                          await refreshUser();
                        } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
                        finally { setPaypalLoading(false); }
                      }}
                    >
                      {paypalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (language === 'sr' ? 'Otkaži pretplatu' : 'Cancel')}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                  disabled={paypalLoading}
                  onClick={async () => {
                    setPaypalLoading(true);
                    try {
                      const res = await axios.post(`${API_URL}/payments/paypal/create-subscription`, { plan: 'biznis' });
                      if (res.data.approve_url) { window.location.href = res.data.approve_url; }
                      else { toast.error(language === 'sr' ? 'PayPal nije konfigurisan' : 'PayPal not configured'); setPaypalLoading(false); }
                    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); setPaypalLoading(false); }
                  }}
                >
                  {paypalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                  {language === 'sr' ? 'Pretplati se' : 'Subscribe'}
                </Button>
              )}
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

        </>)}
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

// ==================== COUPONS SECTION ====================

function CouponsSection({ language }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });

  const sr = language === 'sr';
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/coupons`);
      setCoupons(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;
    setSaving(true);
    try {
      await axios.post(`${API}/coupons`, {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      });
      toast.success(sr ? 'Kupon kreiran!' : 'Coupon created!');
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '' });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.detail || (sr ? 'Greška' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon) => {
    try {
      await axios.put(`${API}/coupons/${coupon.id}`, { is_active: !coupon.is_active });
      fetchCoupons();
    } catch (e) {
      toast.error(sr ? 'Greška' : 'Error');
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await axios.delete(`${API}/coupons/${id}`);
      toast.success(sr ? 'Kupon obrisan' : 'Coupon deleted');
      fetchCoupons();
    } catch (e) {
      toast.error(sr ? 'Greška' : 'Error');
    }
  };

  return (
    <Card className="animate-fade-in bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-primary" />
              {sr ? 'Kupon Kodovi' : 'Coupon Codes'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {sr ? 'Kreiraj popuste za svoju prodavnicu' : 'Create discounts for your shop'}
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="primary-gradient"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (sr ? 'Otkaži' : 'Cancel') : (sr ? '+ Novi kupon' : '+ New coupon')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleCreate} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400">{sr ? 'Kod' : 'Code'}</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="POPUST20"
                  className="bg-zinc-900 border-zinc-700 uppercase"
                  maxLength={20}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">{sr ? 'Tip popusta' : 'Discount type'}</Label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-white"
                >
                  <option value="percent">{sr ? 'Procenat (%)' : 'Percent (%)'}</option>
                  <option value="fixed">{sr ? 'Fiksni (RSD)' : 'Fixed (RSD)'}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-zinc-400">
                  {form.discount_type === 'percent' ? '%' : 'RSD'}
                </Label>
                <Input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === 'percent' ? '20' : '500'}
                  className="bg-zinc-900 border-zinc-700"
                  min="0"
                  max={form.discount_type === 'percent' ? 100 : undefined}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">{sr ? 'Min. iznos' : 'Min. amount'}</Label>
                <Input
                  type="number"
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  placeholder={sr ? 'Opciono' : 'Optional'}
                  className="bg-zinc-900 border-zinc-700"
                  min="0"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">{sr ? 'Max. korišćenja' : 'Max uses'}</Label>
                <Input
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="∞"
                  className="bg-zinc-900 border-zinc-700"
                  min="1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">{sr ? 'Ističe' : 'Expires'}</Label>
              <Input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full primary-gradient">
              {saving ? '...' : (sr ? 'Kreiraj kupon' : 'Create coupon')}
            </Button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-500" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-sm">
            {sr ? 'Nema kupona. Kreiraj prvi!' : 'No coupons yet. Create one!'}
          </div>
        ) : (
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  coupon.is_active ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-900/30 border-zinc-800 opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold text-primary">{coupon.code}</code>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                      {coupon.discount_type === 'percent'
                        ? `${coupon.discount_value}%`
                        : `${coupon.discount_value} RSD`}
                    </Badge>
                    {!coupon.is_active && (
                      <Badge variant="outline" className="text-[10px] border-red-800 text-red-400">
                        {sr ? 'Neaktivan' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {sr ? 'Korišćeno' : 'Used'}: {coupon.used_count || 0}
                    {coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    {coupon.expires_at ? ` · ${sr ? 'Ističe' : 'Expires'}: ${coupon.expires_at.slice(0, 10)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={() => toggleCoupon(coupon)}
                    className="scale-75"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-red-400"
                    onClick={() => deleteCoupon(coupon.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
