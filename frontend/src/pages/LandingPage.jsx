import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  ShoppingBag, ArrowRight, Zap, BarChart3, Globe, Users, Package, Bell,
  Shield, Star, Check, ChevronRight, ChevronDown, Sparkles, Send, Timer,
  Palette, Menu, X, Crown, TrendingUp, Smartphone, MessageCircle, Heart,
  Eye, MousePointerClick, Instagram, Mail, PlayCircle, Quote
} from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Scroll-reveal hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const [ref, visible] = useInView();
  const base = direction === 'up' ? 'translate-y-10' : direction === 'left' ? '-translate-x-10' : direction === 'right' ? 'translate-x-10' : 'translate-y-10';
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${base}`} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Typing animation ─── */
function useTyping(words, speed = 90, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, charIdx));
        if (charIdx === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
}

/* ─── Animated counter ─── */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [ref, visible] = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);
  return <span ref={ref}>{val.toLocaleString('sr-Latn')}{suffix}</span>;
}

/* ─── FAQ item ─── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-semibold text-[15px] text-zinc-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-5 px-6' : 'max-h-0'}`}>
        <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const typed = useTyping(['narudžbine', 'kupce', 'katalog', 'prodaju', 'analitiku'], 80, 2000);

  useEffect(() => { axios.get(`${API_URL}/health`).catch(() => {}); }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const go = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-orange-500/30">
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      {/* ════════════ NAVBAR ════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/30' : ''}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105">
                <ShoppingBag className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Narucify</span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {[['Kako radi', 'how-it-works'], ['Mogućnosti', 'features'], ['Cene', 'pricing'], ['FAQ', 'faq']].map(([l, id]) => (
                <button key={id} onClick={() => go(id)} className="px-4 py-2 text-[13px] font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all duration-200">{l}</button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 px-5 h-10 rounded-xl transition-all duration-300">
                    Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/[0.06] h-10 rounded-xl font-medium">Uloguj se</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 px-5 h-10 rounded-xl transition-all duration-300">
                      Probaj besplatno <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-[#09090b]/95 backdrop-blur-2xl border-t border-white/[0.06] p-5 space-y-1 animate-in slide-in-from-top-2">
            {[['Kako radi', 'how-it-works'], ['Mogućnosti', 'features'], ['Cene', 'pricing'], ['FAQ', 'faq']].map(([l, id]) => (
              <button key={id} onClick={() => go(id)} className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.05] font-medium">{l}</button>
            ))}
            <div className="pt-4 border-t border-white/[0.06] flex gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="flex-1"><Button className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl">Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1"><Button variant="outline" className="w-full border-zinc-700 text-white rounded-xl">Uloguj se</Button></Link>
                  <Link to="/register" className="flex-1"><Button className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl">Registruj se</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-orange-600/[0.12] via-rose-600/[0.06] to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[100px]" />
          <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] bg-violet-600/[0.04] rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/[0.08] to-rose-500/[0.08] border border-orange-500/20 text-orange-300/90 text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              21 dan besplatno • Bez kreditne kartice
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-[clamp(2.2rem,5.5vw,4.5rem)] font-extrabold leading-[1.08] tracking-tight mb-6">
              Upravljaj{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">{typed}</span>
                <span className="animate-blink text-orange-400">|</span>
              </span>
              <br />
              <span className="text-zinc-500 text-[clamp(1.3rem,3vw,2.4rem)] font-semibold leading-snug">
                kao profesionalac. Sa jednog mesta.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-[17px] md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Narucify je platforma za <span className="text-zinc-200">Instagram i WhatsApp prodavce</span> —
              online katalog, praćenje narudžbina, baza kupaca i analitika.
              Sve u jednom, bez kodiranja.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="relative bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-[16px] font-semibold px-8 h-[56px] rounded-2xl shadow-[0_8px_32px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.45)] transition-all duration-300 group overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/[0.15] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center">
                    Probaj 21 dan besplatno
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>
              <button onClick={() => go('how-it-works')} className="text-zinc-400 hover:text-white flex items-center gap-2 text-[15px] font-medium transition-colors duration-200 group">
                <PlayCircle className="w-5 h-5 group-hover:text-orange-400 transition-colors" />
                Pogledaj kako radi
              </button>
            </div>
          </Reveal>

          {/* ─── Hero Dashboard Mockup ─── */}
          <Reveal delay={400}>
            <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-b from-orange-500/[0.06] via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" />
              {/* Fade bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent z-10 pointer-events-none rounded-2xl" />

              <div className="relative rounded-2xl border border-white/[0.08] bg-[#111113]/90 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f11] border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="bg-white/[0.06] rounded-lg px-4 py-1.5 text-xs text-zinc-500 text-center max-w-sm mx-auto flex items-center justify-center gap-2">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      narucify.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard preview content */}
                <div className="p-5 md:p-8 space-y-5">
                  {/* Welcome bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">Dobro jutro, Jovana 👋</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Utorak, 18. mart 2026.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><Bell className="w-4 h-4 text-orange-400" /></div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Narudžbine danas', value: '18', change: '+5', icon: Package, color: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/10' },
                      { label: 'Mesečni prihod', value: '94.200 RSD', change: '+12%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/10' },
                      { label: 'Kupci', value: '247', change: '+18', icon: Users, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/10' },
                      { label: 'Pregledi kataloga', value: '1.320', change: '+23%', icon: Eye, color: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/10' },
                    ].map((s, i) => (
                      <div key={i} className={`p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-lg ${s.glow}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                            <s.icon className="w-[18px] h-[18px] text-white" />
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{s.change}</span>
                        </div>
                        <p className="text-xl font-bold text-white tracking-tight">{s.value}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Orders table */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-200">Poslednje narudžbine</p>
                      <span className="text-[11px] text-orange-400 font-medium cursor-pointer hover:underline">Prikaži sve →</span>
                    </div>
                    {[
                      { name: 'Marija S.', items: 'Srebrna ogrlica ×2', amount: '4.200 RSD', status: 'Nova', dot: 'bg-orange-400' },
                      { name: 'Nikola P.', items: 'Kožna torbica', amount: '6.500 RSD', status: 'Potvrđena', dot: 'bg-blue-400' },
                      { name: 'Ana M.', items: 'Ručni sapun ×5', amount: '2.500 RSD', status: 'Isporučena', dot: 'bg-emerald-400' },
                    ].map((o, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-300">
                            {o.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{o.name}</p>
                            <p className="text-[11px] text-zinc-500">{o.items}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <p className="text-sm font-semibold text-white">{o.amount}</p>
                          <span className={`w-2 h-2 rounded-full ${o.dot}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ SOCIAL PROOF BAR ════════════ */}
      <section className="py-14 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { end: 500, suffix: '+', label: 'Prodavaca' },
              { end: 15000, suffix: '+', label: 'Narudžbina obrađeno' },
              { end: 6, suffix: '', label: 'Tema za katalog' },
              { end: 21, suffix: ' dan', label: 'Besplatni trial' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"><Counter end={s.end} suffix={s.suffix} /></p>
                <p className="text-sm text-zinc-500 mt-1.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="py-28 md:py-36 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <Reveal className="text-center mb-20">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">Kako funkcioniše</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Počni za 3 minuta. Ozbiljno.</h2>
            <p className="text-zinc-400 mt-4 max-w-lg mx-auto text-[17px]">Bez kodiranja. Bez složenih podešavanja. Registruj se i kreni.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-orange-500/20 via-blue-500/20 to-emerald-500/20" />
            {[
              { step: '01', icon: Send, title: 'Registruj se', desc: 'Kreiraj nalog za 30 sekundi. Email, ime prodavnice — i imaš pristup celom sistemu. 21 dan besplatno.', color: 'from-orange-500 to-rose-600', ring: 'ring-orange-500/20' },
              { step: '02', icon: Package, title: 'Dodaj proizvode', desc: 'Unesi proizvode sa slikama i cenama. Podeli link na Instagramu — kupci naručuju sami, bez DM-a.', color: 'from-blue-500 to-cyan-500', ring: 'ring-blue-500/20' },
              { step: '03', icon: BarChart3, title: 'Upravljaj & rasti', desc: 'Prati narudžbine, analiziraj prodaju, upravljaj kupcima. Sve na jednom mestu, sa bilo kog uređaja.', color: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-500/20' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative group h-full">
                  <div className={`h-full p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                    <div className="text-[3.5rem] font-black text-white/[0.04] absolute top-4 right-6 select-none leading-none">{item.step}</div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-xl ring-4 ${item.ring} relative z-10`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed text-[15px]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="py-28 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
          <Reveal className="text-center mb-20">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">Mogućnosti</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Sve što ti treba. Ništa što ti ne treba.</h2>
          </Reveal>

          <div className="space-y-28">
            {/* Feature 1 — Katalog */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal direction="left">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/15 text-orange-300 text-sm font-medium mb-5">
                    <Globe className="w-4 h-4" /> Online katalog
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 leading-tight">Tvoj katalog. Tvoj brend.</h3>
                  <p className="text-zinc-400 text-[16px] mb-7 leading-relaxed">
                    6 profesionalnih tema za tvoj online katalog. Podeli link na Instagramu — kupci biraju i naručuju sami. Nema više sto poruka u DM-u.
                  </p>
                  <ul className="space-y-3.5">
                    {['6 dizajn tema (Elegance, Midnight, Sunset...)', 'Podrška za akcijske cene i popuste', 'Quick order — narudžbina u 1 klik', 'Share dugme za društvene mreže', 'Vacation mode za pauze'].map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-[15px]">
                        <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-orange-400" /></div>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
                  {/* Catalog mockup — phone frame */}
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50">
                    <div className="bg-white/80 backdrop-blur px-4 py-3 border-b border-stone-200/50">
                      <p className="font-bold text-stone-900 text-center text-[15px]">🛍️ Moja Ponuda</p>
                      <p className="text-[11px] text-stone-500 text-center">Ručno pravljen nakit • Beograd</p>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2.5">
                      {[
                        { name: 'Srebrna ogrlica', price: '2.100', old: '2.800', sale: true },
                        { name: 'Pozlaćene minđuše', price: '1.500', sale: false },
                        { name: 'Narukvica od perli', price: '800', sale: false },
                        { name: 'Prsten sa kamenom', price: '3.200', old: '4.000', sale: true },
                      ].map((p, i) => (
                        <div key={i} className="rounded-xl bg-white shadow-sm border border-stone-100 overflow-hidden group hover:shadow-md transition-shadow">
                          <div className="h-24 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-100 relative flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-stone-300" />
                            {p.sale && <span className="absolute top-1.5 left-1.5 text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">AKCIJA</span>}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[12px] font-semibold text-stone-800 truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[12px] font-bold text-orange-600">{p.price} RSD</p>
                              {p.old && <p className="text-[10px] text-stone-400 line-through">{p.old}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 pb-3">
                      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-center py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-orange-500/20">
                        🛒 Naruči (2 proizvoda)
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Feature 2 — Narudžbine */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal direction="left" delay={100} className="order-2 md:order-1">
                <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
                  {/* Orders mockup */}
                  <div className="space-y-2.5">
                    {[
                      { id: '#1042', name: 'Jovana K.', status: 'Nova', amount: '4.200', color: 'bg-orange-400', time: 'Danas, 14:32', icon: '🆕' },
                      { id: '#1041', name: 'Stefan M.', status: 'U pripremi', amount: '2.800', color: 'bg-blue-400', time: 'Danas, 13:15', icon: '📦' },
                      { id: '#1040', name: 'Milica R.', status: 'Poslato', amount: '6.100', color: 'bg-violet-400', time: 'Danas, 11:20', icon: '🚚' },
                      { id: '#1039', name: 'Petar D.', status: 'Isporučeno', amount: '1.900', color: 'bg-emerald-400', time: 'Juče, 18:45', icon: '✅' },
                    ].map((o, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                        <div className="text-lg">{o.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">{o.name}</p>
                            <span className="text-[10px] text-zinc-600 font-mono">{o.id}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500">{o.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{o.amount} RSD</p>
                          <div className="flex items-center gap-1.5 justify-end mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${o.color}`} />
                            <span className="text-[10px] text-zinc-400">{o.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal direction="right" className="order-1 md:order-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/15 text-blue-300 text-sm font-medium mb-5">
                    <Package className="w-4 h-4" /> Narudžbine
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 leading-tight">Svaka narudžbina pod kontrolom</h3>
                  <p className="text-zinc-400 text-[16px] mb-7 leading-relaxed">
                    Nema više izgubljenih DM poruka. Svaka narudžbina ima status, podatke o kupcu i link za praćenje. Kupac vidi gde mu je pošiljka.
                  </p>
                  <ul className="space-y-3.5">
                    {['Statusy u realnom vremenu', 'Link za praćenje za kupce', 'Automatsko obaveštavanje', 'Export u CSV / PDF'].map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-[15px]">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-blue-400" /></div>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Feature 3 — Analitika */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal direction="left">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/15 text-emerald-300 text-sm font-medium mb-5">
                    <BarChart3 className="w-4 h-4" /> Analitika
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 leading-tight">Znaj šta ti donosi profit</h3>
                  <p className="text-zinc-400 text-[16px] mb-7 leading-relaxed">
                    Dashboard sa brojevima koji su bitni — prihod, narudžbine, top proizvodi, kupaci. Bez komplikovanih tabela, samo ono što treba.
                  </p>
                  <ul className="space-y-3.5">
                    {['Prihod po danima i mesecima', 'Top 5 proizvoda po prodaji', 'Upravljanje troškovima i profitom', 'Evidencija kupaca'].map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-[15px]">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-emerald-400" /></div>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal direction="right" delay={100}>
                <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
                  {/* Analytics mockup */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-200">Prihod — poslednjih 7 dana</p>
                      <span className="text-[12px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +23%</span>
                    </div>
                    <div className="flex items-end gap-2 h-36">
                      {[35, 55, 42, 78, 60, 92, 74].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full rounded-lg bg-gradient-to-t from-orange-500/70 to-orange-400/40 transition-all duration-500" style={{ height: `${h}%` }} />
                          <span className="text-[10px] text-zinc-600 font-medium">{['P', 'U', 'S', 'Č', 'P', 'S', 'N'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                      {[
                        { label: 'Ukupno', value: '87.400 RSD' },
                        { label: 'Prosek/dan', value: '12.485 RSD' },
                        { label: 'Narudžbine', value: '47' },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <p className="text-[15px] font-bold text-white">{s.value}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ BENEFITS ════════════ */}
      <section className="py-28 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">Zašto Narucify</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Napravljeno za male prodavce</h2>
            <p className="text-zinc-400 mt-4 max-w-lg mx-auto text-[17px]">Bez tehničkog znanja. Bez ugovora. Profesionalan alat za svakoga.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Timer, title: 'Setup za 3 min', desc: 'Registruj se, dodaj proizvode, podeli link. Nisi programer? Nema veze.', color: 'from-orange-500 to-rose-600' },
              { icon: Globe, title: 'Online katalog', desc: '6 premium tema. Kupci naručuju sa linka, ne iz DM-a. Manje posla, više prodaje.', color: 'from-blue-500 to-cyan-500' },
              { icon: Smartphone, title: 'Radi sa telefona', desc: 'Upravljaj iz kafića, iz kreveta, sa plaže. Potpuno mobilno iskustvo.', color: 'from-violet-500 to-purple-500' },
              { icon: Users, title: 'Baza kupaca', desc: 'Automatski sačuvani kupci sa istorijom narudžbina. CRM za male prodavce.', color: 'from-emerald-500 to-teal-500' },
              { icon: Shield, title: 'Sigurno', desc: 'Enkripcija podataka i sigurna autentifikacija. Tvoji podaci su samo tvoji.', color: 'from-amber-500 to-orange-500' },
              { icon: Palette, title: 'Tvoj brend', desc: 'Logo, opis, tema — kupci vide tvoj brend. Narucify ostaje u pozadini.', color: 'from-pink-500 to-rose-500' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="group h-full p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[17px] font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-[14px]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="py-28 md:py-36 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">Iskustva korisnika</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Šta kažu naši prodavci</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Jovana M.',
                role: 'Handmade nakit, Instagram',
                text: 'Pre Narucify sam vodila narudžbine u notesu. Sad imam katalog, praćenje, statistiku — kupci su oduševljeni jer mogu sami da naruče.',
                stars: 5
              },
              {
                name: 'Stefan R.',
                role: 'Organska kozmetika',
                text: 'Katalog sa Sunset temom izgleda neverovatno. Kupci mi šalju screenshot da im se sviđa sajt. Plus, quick order je genijalan — naruče za 10 sekundi.',
                stars: 5
              },
              {
                name: 'Milica P.',
                role: 'Odeća & aksesoari',
                text: 'Smanjila sam vreme za obradu narudžbina za 80%. Pre sam gubila sate na DM poruke, sad sve ide automatski. Vredi svaki dinar.',
                stars: 5
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="h-full p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-all duration-300 flex flex-col">
                  <Quote className="w-8 h-8 text-orange-500/30 mb-4" />
                  <p className="text-zinc-300 leading-relaxed text-[15px] flex-1 mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-[13px] font-bold text-white shadow-lg">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[12px] text-zinc-500">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="py-28 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">Cene</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Jednostavno. Transparentno.</h2>
            <p className="text-zinc-400 mt-4 max-w-lg mx-auto text-[17px]">21 dan besplatno. Bez skrivenih troškova. Otkaži kad hoćeš.</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-7 max-w-4xl mx-auto">
            {/* Starter */}
            <Reveal>
              <div className="h-full p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                  <p className="text-zinc-500 text-sm">Za početnike koji tek kreću</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold tracking-tight text-white">0 RSD</span>
                  <span className="text-zinc-500 text-sm ml-2">/ zauvek</span>
                </div>
                <ul className="space-y-3.5 mb-10 flex-1">
                  {[
                    'Do 10 proizvoda u katalogu',
                    'Neograničene narudžbine',
                    'Upravljanje kupcima',
                    'Link za online narudžbinu',
                    'Praćenje narudžbina za kupce',
                    '6 tema za katalog',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300 text-[14px]">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-emerald-400" /></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant="outline" className="w-full h-[52px] rounded-xl border-white/[0.10] text-white hover:bg-white/[0.06] text-[15px] font-semibold transition-all duration-300">
                    Započni besplatno
                  </Button>
                </Link>
              </div>
            </Reveal>

            {/* PRO */}
            <Reveal delay={120}>
              <div className="relative h-full p-8 rounded-2xl border border-orange-500/25 bg-gradient-to-b from-orange-500/[0.06] to-white/[0.02] flex flex-col shadow-[0_0_60px_-15px_rgba(249,115,22,0.15)]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-bold shadow-xl shadow-orange-500/30">
                    <Crown className="w-3.5 h-3.5" /> NAJPOPULARNIJI
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="text-xl font-bold text-white mb-1">PRO</h3>
                  <p className="text-zinc-400 text-sm">Za ozbiljne prodavce</p>
                </div>
                <div className="mb-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">999 RSD</span>
                  <span className="text-zinc-400 text-sm ml-2">/ mesečno</span>
                </div>
                <p className="text-[13px] text-orange-400 font-medium mb-8">Prvih 21 dan potpuno besplatno</p>
                <ul className="space-y-3.5 mb-10 flex-1">
                  {[
                    'Sve iz Starter plana',
                    'Neograničen broj proizvoda',
                    'Napredna analitika i statistike',
                    'Upravljanje finansijama',
                    'Export u CSV / PDF',
                    'Prioritetna podrška',
                    'Custom branding',
                    'Email marketing (uskoro)',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-200 text-[14px]">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-orange-400" /></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="w-full h-[52px] rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 text-[15px] font-semibold transition-all duration-300">
                    Probaj 21 dan besplatno <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section id="faq" className="py-28 md:py-36">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-[0.15em] mb-3">FAQ</p>
            <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight">Česta pitanja</h2>
          </Reveal>

          <div className="space-y-3">
            <FAQItem q="Da li je Narucify zaista besplatan?" a="Da. Starter plan je besplatan zauvek sa do 10 proizvoda u katalogu i neograničenim narudžbinama. PRO plan možeš probati 21 dan potpuno besplatno, bez obaveza." />
            <FAQItem q="Da li mi treba kreditna kartica za registraciju?" a="Ne. Registracija je potpuno besplatna i ne zahteva nikakve podatke o plaćanju. Karticu dodaješ tek kad odlučiš da nadogradiš na PRO." />
            <FAQItem q="Kako kupci naručuju preko kataloga?" a="Kupci otvaraju tvoj link (koji podeliš na Instagramu, WhatsApp-u, bio-u...), biraju proizvode, unose podatke za dostavu i potvrde narudžbinu. Ti dobiješ obaveštenje odmah." />
            <FAQItem q="Da li mogu da koristim Narucify sa telefona?" a="Apsolutno. Narucify je potpuno mobilno-optimizovan. Upravljaj narudžbinama, dodaj proizvode, prati statistiku — sve sa telefona, gde god da si." />
            <FAQItem q="Mogu li da otkazem PRO plan u bilo kom trenutku?" a="Da. Nema ugovora ni obaveza. Možeš otkazati bilo kad i nastaviti da koristiš besplatni Starter plan." />
            <FAQItem q="Da li podržavate plaćanje karticom na katalogu?" a="Trenutno Narucify podržava naručivanje gde se plaćanje vrši pri preuzimanju (pouzećem) ili dogovorom sa prodavcem. Online plaćanje karticom dolazi uskoro." />
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-t from-orange-500/[0.08] via-rose-500/[0.03] to-transparent rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight mb-6 leading-tight">
              Spreman da preuzmeš kontrolu<br className="hidden sm:block" /> nad svojom prodajom?
            </h2>
            <p className="text-zinc-400 text-[17px] mb-10 max-w-xl mx-auto leading-relaxed">
              Kreiraj nalog, dodaj proizvode i počni da primaš narudžbine — za par minuta. Prvih 21 dan na nas.
            </p>
            <Link to="/register">
              <Button size="lg" className="relative bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-[16px] font-semibold px-10 h-[58px] rounded-2xl shadow-[0_8px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_50px_rgba(249,115,22,0.5)] transition-all duration-300 group overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/[0.15] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Probaj 21 dan besplatno
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </Link>
            <p className="text-[13px] text-zinc-600 mt-6 font-medium">Bez kreditne kartice • Otkaži kad hoćeš • Setup za 3 minuta</p>
          </Reveal>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-white/[0.06] py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid md:grid-cols-4 gap-10 md:gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Narucify</span>
              </Link>
              <p className="text-sm text-zinc-500 leading-relaxed">Platforma za upravljanje narudžbinama za Instagram i WhatsApp prodavce.</p>
            </div>

            {/* Product */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-4">Proizvod</p>
              <div className="space-y-2.5">
                {[['Kako radi', 'how-it-works'], ['Mogućnosti', 'features'], ['Cene', 'pricing'], ['FAQ', 'faq']].map(([l, id]) => (
                  <button key={id} onClick={() => go(id)} className="block text-sm text-zinc-500 hover:text-white transition-colors">{l}</button>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-4">Pravno</p>
              <div className="space-y-2.5">
                <p className="text-sm text-zinc-500">Uslovi korišćenja</p>
                <p className="text-sm text-zinc-500">Politika privatnosti</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-4">Kontakt</p>
              <div className="space-y-2.5">
                <a href="mailto:podrska@narucify.com" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" /> podrska@narucify.com
                </a>
                <a href="https://instagram.com/narucify" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                  <Instagram className="w-4 h-4" /> @narucify
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-600">© 2026 Narucify. Sva prava zadržana.</p>
            <p className="text-[12px] text-zinc-700">Napravljeno sa ❤️ u Srbiji</p>
          </div>
        </div>
      </footer>

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient { animation: gradient 4s ease infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 0.8s ease infinite; }
      `}</style>
    </div>
  );
}
