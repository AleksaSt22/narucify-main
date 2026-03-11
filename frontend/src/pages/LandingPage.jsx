import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  ShoppingBag,
  ArrowRight,
  Zap,
  BarChart3,
  Globe,
  Users,
  Package,
  Bell,
  Shield,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  Send,
  Timer,
  Palette,
  Menu,
  X,
  Crown,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Animate on scroll hook
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
    }, { threshold: 0.15, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Wake up backend
  useEffect(() => {
    axios.get(`${API_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Narucify
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                ['Kako radi', 'how-it-works'],
                ['Mogućnosti', 'features'],
                ['Cene', 'pricing'],
              ].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="px-3.5 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                  {label}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25 px-5">
                    Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5">
                      Uloguj se
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25 px-5">
                      Registruj se <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu btn */}
            <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/50 p-4 space-y-1 animate-in slide-in-from-top-2">
            {[['Kako radi', 'how-it-works'], ['Mogućnosti', 'features'], ['Cene', 'pricing']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-white rounded-lg hover:bg-white/5">
                {label}
              </button>
            ))}
            <div className="pt-3 border-t border-zinc-800 flex gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full border-zinc-700 text-white">Uloguj se</Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white">Registruj se</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-orange-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(249,115,22,0.08),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Besplatno za početi • Bez kreditne kartice
            </div>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Tvoja prodavnica.{' '}
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Tvoja pravila.
              </span>
              <br />
              <span className="text-zinc-400 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-semibold">
                Upravljaj narudžbinama kao profesionalac.
              </span>
            </h1>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Narucify je sve-u-jednom platforma za Instagram i WhatsApp prodavce.
              Kreiraj katalog, primaj narudžbine, prati kupce — sve sa jednog mesta.
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-lg px-8 h-14 rounded-xl shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all group">
                  Započni besplatno
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button onClick={() => scrollTo('how-it-works')} className="text-zinc-400 hover:text-white flex items-center gap-2 text-lg transition-colors">
                Pogledaj kako radi
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>

          {/* Hero "screenshot" mockup */}
          <AnimatedSection delay={500}>
            <div className="mt-16 md:mt-20 relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-zinc-800 rounded-lg px-4 py-1.5 text-xs text-zinc-500 text-center max-w-md mx-auto">
                      narucify.vercel.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard preview */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Narudžbine danas', value: '24', icon: Package, color: 'from-orange-500 to-rose-500' },
                      { label: 'Prihod ovog meseca', value: '125.800 RSD', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Ukupno kupaca', value: '312', icon: Users, color: 'from-blue-500 to-cyan-500' },
                      { label: 'Proizvodi', value: '48', icon: ShoppingBag, color: 'from-violet-500 to-purple-500' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 opacity-80`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Recent orders mock */}
                  <div className="rounded-xl bg-zinc-800/30 border border-zinc-700/30 overflow-hidden">
                    <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700/30">
                      <p className="text-sm font-medium text-zinc-300">Poslednje narudžbine</p>
                    </div>
                    {[
                      { name: 'Marija S.', items: 'Srebrna ogrlica ×2', amount: '4.200 RSD', status: 'Novo', statusColor: 'bg-orange-500/20 text-orange-300' },
                      { name: 'Nikola P.', items: 'Kožna torbica', amount: '6.500 RSD', status: 'Potvrđeno', statusColor: 'bg-blue-500/20 text-blue-300' },
                      { name: 'Ana M.', items: 'Ručno rađeni sapun ×5', amount: '2.500 RSD', status: 'Isporučeno', statusColor: 'bg-emerald-500/20 text-emerald-300' },
                    ].map((order, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/20 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                            {order.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{order.name}</p>
                            <p className="text-xs text-zinc-500">{order.items}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{order.amount}</p>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ========== SOCIAL PROOF ========== */}
      <section className="py-12 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-zinc-500">
            {[
              { num: '500+', label: 'Registrovanih prodavaca' },
              { num: '10.000+', label: 'Obrađenih narudžbina' },
              { num: '4.9/5', label: 'Prosečna ocena' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.num}</p>
                <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Kako funkcioniše</p>
            <h2 className="text-3xl md:text-5xl font-bold">Počni za 3 minuta</h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-lg">Bez složenih podešavanja. Bez kodiranja. Samo se registruj i kreni.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                icon: Send,
                title: 'Registruj se',
                desc: 'Kreiraj nalog za 30 sekundi. Uneseš email, ime prodavnice — i odmah imaš pristup celom sistemu.',
                color: 'from-orange-500 to-rose-500'
              },
              {
                step: '02',
                icon: Package,
                title: 'Dodaj proizvode',
                desc: 'Kreiraj katalog sa slikama, cenama i zalihom. Podeli link na Instagramu ili WhatsApp-u — kupci naručuju sami.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Upravljaj & rasti',
                desc: 'Prati narudžbine, upravljaj kupcima, analiziraj prodaju. Sve na jednom mestu, sa telefona ili računara.',
                color: 'from-emerald-500 to-teal-500'
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <div className="relative group">
                  {/* Connector line */}
                  {i < 2 && <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-zinc-700 to-transparent z-0" />}
                  <div className="relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 duration-300">
                    <div className="text-5xl font-black text-zinc-800 absolute top-4 right-6 select-none">{item.step}</div>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES / SCREENSHOTS ========== */}
      <section id="features" className="py-24 md:py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Mogućnosti</p>
            <h2 className="text-3xl md:text-5xl font-bold">Sve što ti treba. Na jednom mestu.</h2>
          </AnimatedSection>

          {/* Feature rows - alternating layout */}
          <div className="space-y-24">
            {/* Feature 1 — Catalog */}
            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-300 text-sm mb-4">
                    <Globe className="w-4 h-4" /> Online katalog
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Tvoj katalog, tvoj brend</h3>
                  <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                    Kreiraj profesionalni online katalog sa 6 predivnih tema. Podeli link na Instagramu — kupci biraju proizvode i naručuju bez da ti pišu u DM.
                  </p>
                  <ul className="space-y-3">
                    {['6 tema dizajna (Elegance, Midnight, Sunset...)', 'Podrška za akcijske cene', 'Dugme za brzu narudžbinu (1 klik)', 'Deljenje proizvoda na društvene mreže'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1.5 shadow-2xl">
                  {/* Mini catalog mockup */}
                  <div className="rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 p-6 text-zinc-900">
                    <div className="text-center mb-4">
                      <p className="font-bold text-lg">🛍️ Moja Ponuda</p>
                      <p className="text-xs text-zinc-500">Ručno pravljen nakit</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Srebrna ogrlica', price: '2.100 RSD', sale: true },
                        { name: 'Pozlaćene minđuše', price: '1.500 RSD', sale: false },
                        { name: 'Narukvica od perli', price: '800 RSD', sale: false },
                        { name: 'Prsten sa kamenom', price: '3.200 RSD', sale: true },
                      ].map((p, i) => (
                        <div key={i} className="rounded-lg bg-white shadow-sm border border-stone-200 overflow-hidden">
                          <div className="h-20 bg-gradient-to-br from-stone-200 to-stone-300 relative">
                            {p.sale && <span className="absolute top-1 left-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">AKCIJA</span>}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{p.name}</p>
                            <p className="text-xs font-bold text-stone-700">{p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Feature 2 — Order Management */}
            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
                  {/* Orders mockup */}
                  <div className="space-y-3">
                    {[
                      { id: '#1042', name: 'Jovana K.', status: 'Novo', amount: '4.200', color: 'bg-orange-500', time: 'Danas, 14:32' },
                      { id: '#1041', name: 'Stefan M.', status: 'U pripremi', amount: '2.800', color: 'bg-blue-500', time: 'Danas, 13:15' },
                      { id: '#1040', name: 'Milica R.', status: 'Poslato', amount: '6.100', color: 'bg-violet-500', time: 'Danas, 11:20' },
                      { id: '#1039', name: 'Petar D.', status: 'Isporučeno', amount: '1.900', color: 'bg-emerald-500', time: 'Juče, 18:45' },
                    ].map((o, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                        <div className={`w-2 h-8 rounded-full ${o.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{o.name}</p>
                            <span className="text-[10px] text-zinc-500">{o.id}</span>
                          </div>
                          <p className="text-xs text-zinc-500">{o.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{o.amount} RSD</p>
                          <span className="text-[10px] text-zinc-400">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 text-sm mb-4">
                    <Package className="w-4 h-4" /> Narudžbine
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Sve narudžbine pod kontrolom</h3>
                  <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                    Svaka narudžbina ima status, praćenje i podatke o kupcu. Nema više izgubljenih poruka u DM-u ili neodgovorenih narudžbina.
                  </p>
                  <ul className="space-y-3">
                    {['Status narudžbine u realnom vremenu', 'Link za praćenje za kupce', 'Automatsko obaveštavanje', 'Export u CSV / PDF'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Feature 3 — Analytics */}
            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-sm mb-4">
                    <BarChart3 className="w-4 h-4" /> Analitika
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Znaj šta ti donosi profit</h3>
                  <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                    Dashboard sa svim bitnim brojevima — prihod, broj narudžbina, top proizvodi, statistika kupaca. Bez komplikovanih tabela.
                  </p>
                  <ul className="space-y-3">
                    {['Pregled prihoda po danima/mesecima', 'Top 5 proizvoda po prodaji', 'Upravljanje troškovima i profitom', 'Evidencija kupaca i ponašanja'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
                  {/* Analytics mockup */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-300">Prihod (poslednjih 7 dana)</p>
                      <span className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +23%</span>
                    </div>
                    {/* Bar chart mockup */}
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-md bg-gradient-to-t from-orange-500/80 to-orange-400/60" style={{ height: `${h}%` }} />
                          <span className="text-[9px] text-zinc-600">{['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
                      {[
                        { label: 'Ukupno', value: '87.400 RSD' },
                        { label: 'Prosek', value: '12.485 RSD' },
                        { label: 'Narudžbine', value: '47' },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <p className="text-lg font-bold text-white">{s.value}</p>
                          <p className="text-[10px] text-zinc-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ========== BENEFITS GRID ========== */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Zašto Narucify</p>
            <h2 className="text-3xl md:text-5xl font-bold">Napravljeno za male prodavce</h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-lg">Bez tehničkog znanja. Bez mesečnih ugovora. Profesionalan alat za svakoga.</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Timer, title: 'Brz start', desc: 'Registruj se, dodaj proizvode i primaj narudžbine — sve za par minuta.', color: 'from-orange-500 to-rose-500' },
              { icon: Globe, title: 'Online katalog', desc: '6 profesionalnih tema. Podeli link i kupci naručuju sami, bez DM poruka.', color: 'from-blue-500 to-cyan-500' },
              { icon: Smartphone, title: 'Mobilni pristup', desc: 'Radi savršeno sa telefona. Upravljaj poslom iz kafića, iz kuće, odakle god.', color: 'from-violet-500 to-purple-500' },
              { icon: Users, title: 'Baza kupaca', desc: 'Automatski sačuvani kupci sa istorijom narudžbina. Znaš ko kupuje i šta.', color: 'from-emerald-500 to-teal-500' },
              { icon: Shield, title: 'Bezbedno', desc: 'Enkripcija podataka, sigurna autentifikacija. Tvoji podaci su samo tvoji.', color: 'from-amber-500 to-orange-500' },
              { icon: Palette, title: 'Tvoj brend', desc: 'Prilagodi katalog logom, opisom, temom. Kupci vide tvoj brend, ne naš.', color: 'from-pink-500 to-rose-500' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-24 md:py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Cene</p>
            <h2 className="text-3xl md:text-5xl font-bold">Jednostavno i fer</h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-lg">Počni besplatno. Nadogradi kad ti zatreba više.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <AnimatedSection>
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">Besplatno</h3>
                  <p className="text-zinc-500 text-sm">Za početnike koji tek kreću</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">0 RSD</span>
                  <span className="text-zinc-500 text-sm ml-1">/ zauvek</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Do 10 proizvoda u katalogu',
                    'Neograničene narudžbine',
                    'Upravljanje kupcima',
                    'Link za online narudžbinu',
                    'Link za praćenje narudžbine',
                    '6 tema za katalog',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-700 text-white hover:bg-zinc-800">
                    Započni besplatno
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* PRO Plan */}
            <AnimatedSection delay={150}>
              <div className="relative p-8 rounded-2xl bg-gradient-to-b from-orange-500/10 to-zinc-900 border border-orange-500/30 h-full flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold shadow-lg">
                    <Crown className="w-3.5 h-3.5" /> NAJPOPULARNIJI
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="text-xl font-bold mb-1">PRO</h3>
                  <p className="text-zinc-400 text-sm">Za ozbiljne prodavce</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">999 RSD</span>
                  <span className="text-zinc-400 text-sm ml-1">/ mesečno</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Sve iz besplatnog plana',
                    'Neograničen broj proizvoda',
                    'Analitika i statistike',
                    'Upravljanje finansijama',
                    'Export u CSV / PDF',
                    'Email marketing (uskoro)',
                    'Prioritetna podrška',
                    'Custom branding',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-200 text-sm">
                      <Check className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25">
                    Započni PRO <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-t from-orange-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Spreman da preuzmeš kontrolu nad svojom prodajom?
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Pridruži se stotinama prodavaca koji koriste Narucify da organizuju narudžbine,
              prate kupce i rastu brže nego ikad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-lg px-10 h-14 rounded-xl shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all group">
                  Kreiraj nalog besplatno
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-zinc-600 mt-6">Besplatno zauvek • Bez kreditne kartice • Setup za 3 minuta</p>
          </AnimatedSection>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Narucify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">Kako radi</button>
              <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Mogućnosti</button>
              <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Cene</button>
            </div>
            <p className="text-sm text-zinc-600">© 2026 Narucify. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>

      {/* Gradient text animation */}
      <style>{`
        @keyframes gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient { animation: gradient 4s ease infinite; }
      `}</style>
    </div>
  );
}
