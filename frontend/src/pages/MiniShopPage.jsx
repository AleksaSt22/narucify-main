import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ShoppingBag, 
  Package, 
  Globe,
  Loader2,
  AlertCircle,
  Plus,
  Crown,
  Minus,
  X,
  ArrowLeft,
  Check,
  MapPin,
  CreditCard,
  ShoppingCart,
  Sparkles,
  ChevronUp,
  Share2,
  MessageCircle,
  Instagram,
  Phone,
  Flame,
  PauseCircle,
  Zap,
  Copy,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ==================== TRANSLATIONS ====================
const translations = {
  en: {
    catalog: 'Shop',
    products: 'Products',
    addToOrder: 'Add to Cart',
    outOfStock: 'Out of Stock',
    currency: 'RSD',
    loading: 'Loading...',
    shopNotFound: 'Shop not found',
    noProducts: 'No products available yet',
    noProductsDesc: 'Check back soon for new arrivals!',
    poweredBy: 'Powered by Narucify',
    total: 'Total',
    checkout: 'Complete Order',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Delivery Address',
    city: 'City',
    postalCode: 'Postal Code',
    email: 'Email (optional)',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    subscribePromo: 'I want to receive promotions and special offers',
    confirmOrder: 'Confirm Order',
    orderSuccess: 'Order Confirmed!',
    thankYou: "Thank you for your order! We'll get it to you as soon as possible.",
    orderNumber: 'Your order number',
    trackOrder: 'Track Order',
    continueShopping: 'Continue Shopping',
    addedToCart: 'Added to cart!',
    deliveryInfo: 'Delivery Information',
    orderSummary: 'Order Summary',
    browseProducts: 'Browse our collection',
    allProducts: 'All Products',
    items: 'items',
    paymentMethod: 'Payment Method',
    backToShop: 'Back to Shop',
    lastItems: 'Only {n} left!',
    onSale: 'SALE',
    orderNow: 'Order Now',
    share: 'Share',
    linkCopied: 'Link copied!',
    vacationTitle: 'Shop is on break',
    vacationDefault: 'We are temporarily paused. Come back soon!',
    contactUs: 'Contact us',
    wasPrice: 'was',
    searchProducts: 'Search products...',
    allCategories: 'All',
    sortDefault: 'Default',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortNewest: 'Newest',
    wishlist: 'Wishlist',
    addedToWishlist: 'Added to wishlist!',
    removedFromWishlist: 'Removed from wishlist',
    noResults: 'No products found',
    productDetails: 'Product Details',
    description: 'Description',
    price: 'Price',
    inStock: 'In Stock',
    backToProducts: 'Back to Products',
    otherProducts: 'Other Products',
    category: 'Category',
  },
  sr: {
    catalog: 'Prodavnica',
    products: 'Proizvodi',
    addToOrder: 'Dodaj u korpu',
    outOfStock: 'Nema na stanju',
    currency: 'RSD',
    loading: 'Učitavanje...',
    shopNotFound: 'Prodavnica nije pronađena',
    noProducts: 'Još nema proizvoda',
    noProductsDesc: 'Vrati se uskoro po nove proizvode!',
    poweredBy: 'Powered by Narucify',
    total: 'Ukupno',
    checkout: 'Završi porudžbinu',
    fullName: 'Ime i prezime',
    phone: 'Broj telefona',
    address: 'Adresa za dostavu',
    city: 'Grad',
    postalCode: 'Poštanski broj',
    email: 'Email (opciono)',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    subscribePromo: 'Želim da primam promocije i specijalne ponude',
    confirmOrder: 'Potvrdi porudžbinu',
    orderSuccess: 'Porudžbina potvrđena!',
    thankYou: 'Hvala na porudžbini! Isporučujemo ti je što pre.',
    orderNumber: 'Broj tvoje porudžbine',
    trackOrder: 'Prati porudžbinu',
    continueShopping: 'Nastavi kupovinu',
    addedToCart: 'Dodato u korpu!',
    deliveryInfo: 'Podaci za dostavu',
    orderSummary: 'Pregled porudžbine',
    browseProducts: 'Pogledaj našu ponudu',
    allProducts: 'Svi proizvodi',
    items: 'artikala',
    paymentMethod: 'Način plaćanja',
    backToShop: 'Nazad u prodavnicu',
    lastItems: 'Još samo {n}!',
    onSale: 'AKCIJA',
    orderNow: 'Poruči odmah',
    share: 'Podeli',
    linkCopied: 'Link kopiran!',
    vacationTitle: 'Prodavnica je na pauzi',
    vacationDefault: 'Privremeno smo pauzirali. Vrati se uskoro!',
    contactUs: 'Kontaktiraj nas',
    wasPrice: 'bilo',
    searchProducts: 'Pretra\u017ei proizvode...',
    allCategories: 'Sve',
    sortDefault: 'Podrazumevano',
    sortPriceLow: 'Cena: niska ka visokoj',
    sortPriceHigh: 'Cena: visoka ka niskoj',
    sortNewest: 'Najnovije',
    wishlist: 'Lista \u017eelja',
    addedToWishlist: 'Dodato u listu \u017eelja!',
    removedFromWishlist: 'Uklonjeno iz liste \u017eelja',
    noResults: 'Nema rezultata',
    productDetails: 'Detalji proizvoda',
    description: 'Opis',
    price: 'Cena',
    inStock: 'Na stanju',
    backToProducts: 'Nazad na proizvode',
    otherProducts: 'Ostali proizvodi',
    category: 'Kategorija',
  }
};

// ==================== THEME SYSTEM ====================
const themes = {
  elegance: {
    name: 'Elegance',
    bg: 'bg-stone-50',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-stone-200',
    cardBg: 'bg-white',
    cardBorder: 'border border-stone-200 hover:border-stone-300',
    cardShadow: 'shadow-sm hover:shadow-lg',
    textPrimary: 'text-stone-900',
    textSecondary: 'text-stone-500',
    textPrice: 'text-stone-900',
    accent: 'bg-stone-900 text-white hover:bg-stone-800',
    accentLight: 'bg-stone-100 text-stone-900',
    badge: 'bg-stone-900 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-600 border border-red-200',
    inputBg: 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-400',
    cartBg: 'bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
    heroBg: 'bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30',
    heroText: 'text-stone-900',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/50',
    checkoutBg: 'bg-stone-50',
    successBg: 'bg-stone-50',
    successCard: 'bg-white border border-stone-200',
    divider: 'border-stone-200',
    btnOutline: 'border-stone-300 text-stone-700 hover:bg-stone-100',
    radioBox: 'bg-stone-50 border border-stone-200',
    watermarkBg: 'bg-white/90 border-t border-stone-200',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-stone-300',
    cartIcon: 'text-stone-900',
    imgPlaceholder: 'bg-stone-100',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-zinc-950',
    headerBg: 'bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800',
    cardBg: 'bg-zinc-900',
    cardBorder: 'border border-zinc-800 hover:border-zinc-700',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-400',
    textPrice: 'text-violet-400',
    accent: 'bg-violet-600 text-white hover:bg-violet-500',
    accentLight: 'bg-violet-500/10 text-violet-400',
    badge: 'bg-violet-600 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-zinc-800 border-zinc-700 text-white focus:border-violet-500',
    cartBg: 'bg-zinc-900 border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-zinc-900 via-violet-950/30 to-zinc-900',
    heroText: 'text-white',
    heroSub: 'text-zinc-400',
    sectionBg: 'bg-zinc-900/50',
    checkoutBg: 'bg-zinc-950',
    successBg: 'bg-zinc-950',
    successCard: 'bg-zinc-900 border border-zinc-800',
    divider: 'border-zinc-800',
    btnOutline: 'border-zinc-700 text-zinc-300 hover:bg-zinc-800',
    radioBox: 'bg-zinc-800 border border-zinc-700',
    watermarkBg: 'bg-zinc-900/90 border-t border-zinc-800',
    watermarkText: 'text-zinc-500',
    emptyIcon: 'text-zinc-600',
    cartIcon: 'text-violet-400',
    imgPlaceholder: 'bg-zinc-800',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-orange-50/50',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-orange-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-orange-100 hover:border-orange-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-orange-100/50',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    textPrice: 'text-orange-600',
    accent: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600',
    accentLight: 'bg-orange-50 text-orange-600',
    badge: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-orange-50/50 border-orange-200 text-stone-800 focus:border-orange-400',
    cartBg: 'bg-white border-t border-orange-100 shadow-[0_-4px_20px_rgba(249,115,22,0.08)]',
    heroBg: 'bg-gradient-to-br from-orange-100 via-rose-50 to-amber-50',
    heroText: 'text-stone-800',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-orange-50/30',
    successBg: 'bg-orange-50/30',
    successCard: 'bg-white border border-orange-100',
    divider: 'border-orange-100',
    btnOutline: 'border-orange-200 text-stone-700 hover:bg-orange-50',
    radioBox: 'bg-orange-50/50 border border-orange-200',
    watermarkBg: 'bg-white/90 border-t border-orange-100',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-orange-200',
    cartIcon: 'text-orange-500',
    imgPlaceholder: 'bg-orange-50',
  },
  nature: {
    name: 'Nature',
    bg: 'bg-emerald-50/30',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-emerald-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-emerald-100 hover:border-emerald-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-emerald-100/50',
    textPrimary: 'text-stone-800',
    textSecondary: 'text-stone-500',
    textPrice: 'text-emerald-600',
    accent: 'bg-emerald-600 text-white hover:bg-emerald-500',
    accentLight: 'bg-emerald-50 text-emerald-700',
    badge: 'bg-emerald-600 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-emerald-50/30 border-emerald-200 text-stone-800 focus:border-emerald-400',
    cartBg: 'bg-white border-t border-emerald-100 shadow-[0_-4px_20px_rgba(16,185,129,0.08)]',
    heroBg: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-50',
    heroText: 'text-stone-800',
    heroSub: 'text-stone-500',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-emerald-50/20',
    successBg: 'bg-emerald-50/20',
    successCard: 'bg-white border border-emerald-100',
    divider: 'border-emerald-100',
    btnOutline: 'border-emerald-200 text-stone-700 hover:bg-emerald-50',
    radioBox: 'bg-emerald-50/50 border border-emerald-200',
    watermarkBg: 'bg-white/90 border-t border-emerald-100',
    watermarkText: 'text-stone-400',
    emptyIcon: 'text-emerald-200',
    cartIcon: 'text-emerald-600',
    imgPlaceholder: 'bg-emerald-50',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-slate-900',
    headerBg: 'bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50',
    cardBg: 'bg-slate-800/80',
    cardBorder: 'border border-slate-700/50 hover:border-cyan-500/30',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-cyan-500/10',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textPrice: 'text-cyan-400',
    accent: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500',
    accentLight: 'bg-cyan-500/10 text-cyan-400',
    badge: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-slate-700/50 border-slate-600 text-white focus:border-cyan-500',
    cartBg: 'bg-slate-800 border-t border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-slate-800 via-cyan-950/40 to-blue-950/30',
    heroText: 'text-white',
    heroSub: 'text-slate-400',
    sectionBg: 'bg-slate-800/30',
    checkoutBg: 'bg-slate-900',
    successBg: 'bg-slate-900',
    successCard: 'bg-slate-800 border border-slate-700/50',
    divider: 'border-slate-700/50',
    btnOutline: 'border-slate-600 text-slate-300 hover:bg-slate-700',
    radioBox: 'bg-slate-700/50 border border-slate-600',
    watermarkBg: 'bg-slate-800/90 border-t border-slate-700/50',
    watermarkText: 'text-slate-500',
    emptyIcon: 'text-slate-600',
    cartIcon: 'text-cyan-400',
    imgPlaceholder: 'bg-slate-700',
  },
  minimal: {
    name: 'Minimal',
    bg: 'bg-white',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-neutral-100',
    cardBg: 'bg-white',
    cardBorder: 'border-0',
    cardShadow: 'hover:shadow-md',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-400',
    textPrice: 'text-neutral-900',
    accent: 'bg-neutral-900 text-white hover:bg-neutral-800',
    accentLight: 'bg-neutral-100 text-neutral-900',
    badge: 'bg-neutral-900 text-white',
    badgeOutOfStock: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
    inputBg: 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-neutral-400',
    cartBg: 'bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]',
    heroBg: 'bg-neutral-50',
    heroText: 'text-neutral-900',
    heroSub: 'text-neutral-400',
    sectionBg: 'bg-neutral-50/50',
    checkoutBg: 'bg-white',
    successBg: 'bg-white',
    successCard: 'bg-neutral-50 border border-neutral-100',
    divider: 'border-neutral-100',
    btnOutline: 'border-neutral-200 text-neutral-700 hover:bg-neutral-50',
    radioBox: 'bg-neutral-50 border border-neutral-200',
    watermarkBg: 'bg-white/90 border-t border-neutral-100',
    watermarkText: 'text-neutral-300',
    emptyIcon: 'text-neutral-200',
    cartIcon: 'text-neutral-900',
    imgPlaceholder: 'bg-neutral-50',
  },
  cherry: {
    name: 'Cherry',
    bg: 'bg-rose-50/40',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-rose-200',
    cardBg: 'bg-white',
    cardBorder: 'border border-rose-100 hover:border-rose-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-rose-100/50',
    textPrimary: 'text-rose-950',
    textSecondary: 'text-rose-400',
    textPrice: 'text-rose-600',
    accent: 'bg-rose-600 text-white hover:bg-rose-500',
    accentLight: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-600 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-rose-50/50 border-rose-200 text-rose-900 focus:border-rose-400',
    cartBg: 'bg-white border-t border-rose-200 shadow-[0_-4px_20px_rgba(244,63,94,0.08)]',
    heroBg: 'bg-gradient-to-br from-rose-100 via-pink-50 to-red-50/30',
    heroText: 'text-rose-950',
    heroSub: 'text-rose-400',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-rose-50/20',
    successBg: 'bg-rose-50/20',
    successCard: 'bg-white border border-rose-100',
    divider: 'border-rose-100',
    btnOutline: 'border-rose-200 text-rose-700 hover:bg-rose-50',
    radioBox: 'bg-rose-50/50 border border-rose-200',
    watermarkBg: 'bg-white/90 border-t border-rose-100',
    watermarkText: 'text-rose-300',
    emptyIcon: 'text-rose-200',
    cartIcon: 'text-rose-600',
    imgPlaceholder: 'bg-rose-50',
  },
  lavender: {
    name: 'Lavender',
    bg: 'bg-purple-50/30',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-purple-100',
    cardBg: 'bg-white',
    cardBorder: 'border border-purple-100 hover:border-purple-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-purple-100/50',
    textPrimary: 'text-purple-950',
    textSecondary: 'text-purple-400',
    textPrice: 'text-purple-600',
    accent: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700',
    accentLight: 'bg-purple-50 text-purple-600',
    badge: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-purple-50/30 border-purple-200 text-purple-900 focus:border-purple-400',
    cartBg: 'bg-white border-t border-purple-100 shadow-[0_-4px_20px_rgba(147,51,234,0.08)]',
    heroBg: 'bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-50/30',
    heroText: 'text-purple-950',
    heroSub: 'text-purple-400',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-purple-50/20',
    successBg: 'bg-purple-50/20',
    successCard: 'bg-white border border-purple-100',
    divider: 'border-purple-100',
    btnOutline: 'border-purple-200 text-purple-700 hover:bg-purple-50',
    radioBox: 'bg-purple-50/50 border border-purple-200',
    watermarkBg: 'bg-white/90 border-t border-purple-100',
    watermarkText: 'text-purple-300',
    emptyIcon: 'text-purple-200',
    cartIcon: 'text-purple-600',
    imgPlaceholder: 'bg-purple-50',
  },
  gold: {
    name: 'Gold',
    bg: 'bg-amber-50/30',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-amber-200',
    cardBg: 'bg-white',
    cardBorder: 'border border-amber-100 hover:border-amber-300',
    cardShadow: 'shadow-sm hover:shadow-lg hover:shadow-amber-100/50',
    textPrimary: 'text-amber-950',
    textSecondary: 'text-amber-500',
    textPrice: 'text-amber-700',
    accent: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600',
    accentLight: 'bg-amber-50 text-amber-700',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    badgeOutOfStock: 'bg-red-50 text-red-500 border border-red-200',
    inputBg: 'bg-amber-50/30 border-amber-200 text-amber-900 focus:border-amber-400',
    cartBg: 'bg-white border-t border-amber-200 shadow-[0_-4px_20px_rgba(245,158,11,0.08)]',
    heroBg: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50/30',
    heroText: 'text-amber-950',
    heroSub: 'text-amber-500',
    sectionBg: 'bg-white/60',
    checkoutBg: 'bg-amber-50/20',
    successBg: 'bg-amber-50/20',
    successCard: 'bg-white border border-amber-100',
    divider: 'border-amber-100',
    btnOutline: 'border-amber-200 text-amber-700 hover:bg-amber-50',
    radioBox: 'bg-amber-50/50 border border-amber-200',
    watermarkBg: 'bg-white/90 border-t border-amber-100',
    watermarkText: 'text-amber-300',
    emptyIcon: 'text-amber-200',
    cartIcon: 'text-amber-600',
    imgPlaceholder: 'bg-amber-50',
  },
  arctic: {
    name: 'Arctic',
    bg: 'bg-sky-950',
    headerBg: 'bg-sky-900/90 backdrop-blur-xl border-b border-sky-800',
    cardBg: 'bg-sky-900/80',
    cardBorder: 'border border-sky-800 hover:border-sky-600',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-sky-500/10',
    textPrimary: 'text-sky-50',
    textSecondary: 'text-sky-400',
    textPrice: 'text-sky-300',
    accent: 'bg-sky-500 text-white hover:bg-sky-400',
    accentLight: 'bg-sky-500/10 text-sky-300',
    badge: 'bg-sky-500 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-sky-800/50 border-sky-700 text-white focus:border-sky-400',
    cartBg: 'bg-sky-900 border-t border-sky-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-sky-900 via-sky-950 to-indigo-950/30',
    heroText: 'text-sky-50',
    heroSub: 'text-sky-400',
    sectionBg: 'bg-sky-900/30',
    checkoutBg: 'bg-sky-950',
    successBg: 'bg-sky-950',
    successCard: 'bg-sky-900 border border-sky-800',
    divider: 'border-sky-800',
    btnOutline: 'border-sky-700 text-sky-300 hover:bg-sky-800',
    radioBox: 'bg-sky-800/50 border border-sky-700',
    watermarkBg: 'bg-sky-900/90 border-t border-sky-800',
    watermarkText: 'text-sky-600',
    emptyIcon: 'text-sky-700',
    cartIcon: 'text-sky-300',
    imgPlaceholder: 'bg-sky-800',
  },
  coffee: {
    name: 'Coffee',
    bg: 'bg-amber-950',
    headerBg: 'bg-amber-900/90 backdrop-blur-xl border-b border-amber-800',
    cardBg: 'bg-amber-900/80',
    cardBorder: 'border border-amber-800 hover:border-amber-600',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-amber-500/10',
    textPrimary: 'text-amber-50',
    textSecondary: 'text-amber-400',
    textPrice: 'text-amber-300',
    accent: 'bg-amber-600 text-white hover:bg-amber-500',
    accentLight: 'bg-amber-500/10 text-amber-300',
    badge: 'bg-amber-600 text-white',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-amber-800/50 border-amber-700 text-white focus:border-amber-400',
    cartBg: 'bg-amber-900 border-t border-amber-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-amber-900 via-amber-950 to-yellow-950/30',
    heroText: 'text-amber-50',
    heroSub: 'text-amber-400',
    sectionBg: 'bg-amber-900/30',
    checkoutBg: 'bg-amber-950',
    successBg: 'bg-amber-950',
    successCard: 'bg-amber-900 border border-amber-800',
    divider: 'border-amber-800',
    btnOutline: 'border-amber-700 text-amber-300 hover:bg-amber-800',
    radioBox: 'bg-amber-800/50 border border-amber-700',
    watermarkBg: 'bg-amber-900/90 border-t border-amber-800',
    watermarkText: 'text-amber-600',
    emptyIcon: 'text-amber-700',
    cartIcon: 'text-amber-300',
    imgPlaceholder: 'bg-amber-800',
  },
  neon: {
    name: 'Neon',
    bg: 'bg-gray-950',
    headerBg: 'bg-gray-900/90 backdrop-blur-xl border-b border-gray-800',
    cardBg: 'bg-gray-900',
    cardBorder: 'border border-gray-800 hover:border-lime-500/40',
    cardShadow: 'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-lime-500/10',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-400',
    textPrice: 'text-lime-400',
    accent: 'bg-gradient-to-r from-lime-500 to-green-500 text-gray-950 font-semibold hover:from-lime-400 hover:to-green-400',
    accentLight: 'bg-lime-500/10 text-lime-400',
    badge: 'bg-gradient-to-r from-lime-500 to-green-500 text-gray-950',
    badgeOutOfStock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    inputBg: 'bg-gray-800 border-gray-700 text-white focus:border-lime-500',
    cartBg: 'bg-gray-900 border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
    heroBg: 'bg-gradient-to-br from-gray-900 via-gray-950 to-lime-950/20',
    heroText: 'text-white',
    heroSub: 'text-gray-400',
    sectionBg: 'bg-gray-900/50',
    checkoutBg: 'bg-gray-950',
    successBg: 'bg-gray-950',
    successCard: 'bg-gray-900 border border-gray-800',
    divider: 'border-gray-800',
    btnOutline: 'border-gray-700 text-gray-300 hover:bg-gray-800',
    radioBox: 'bg-gray-800 border border-gray-700',
    watermarkBg: 'bg-gray-900/90 border-t border-gray-800',
    watermarkText: 'text-gray-500',
    emptyIcon: 'text-gray-600',
    cartIcon: 'text-lime-400',
    imgPlaceholder: 'bg-gray-800',
  }
};

// Export themes for use in SettingsPage
export { themes };

// ==================== COMPONENT ====================
export default function MiniShopPage() {
  const { shopId } = useParams();
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dm-order-public-lang');
    return saved || 'sr';
  });
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`narucify-wishlist-${shopId}`) || '[]'); } catch { return []; }
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    email: '',
    payment_method: 'cash_on_delivery',
    subscribe_promo: false
  });

  const t = (key) => translations[language]?.[key] || key;
  const theme = themes[shop?.shop_theme] || themes.elegance;
  const layout = shop?.shop_layout || 'classic';

  // Shop customizer values
  const shopFont = shop?.shop_font || 'modern';
  const shopButtonStyle = shop?.shop_button_style || 'rounded';
  const shopCardStyle = shop?.shop_card_style || 'shadow';
  const shopHeaderStyle = shop?.shop_header_style || 'left';
  const shopProductsPerRow = shop?.shop_products_per_row || 4;
  const shopShowDesc = shop?.shop_show_product_description ?? true;
  const shopHeroStyle = shop?.shop_hero_style || 'banner';

  const fontFamilies = {
    modern: "'Inter', sans-serif",
    classic: "'Merriweather', serif",
    elegant: "'Playfair Display', serif",
    playful: "'Nunito', sans-serif",
    mono: "'JetBrains Mono', monospace",
  };
  const fontFamily = fontFamilies[shopFont] || fontFamilies.modern;

  const btnRadius = shopButtonStyle === 'pill' ? '9999px' : shopButtonStyle === 'square' ? '0px' : '0.5rem';

  const cardClass = shopCardStyle === 'shadow' ? 'shadow-md' 
    : shopCardStyle === 'border' ? 'border-2' 
    : shopCardStyle === 'elevated' ? 'shadow-xl shadow-black/30' 
    : '';

  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  }[shopProductsPerRow] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  const headerAlign = shopHeaderStyle === 'center' ? 'text-center items-center' : shopHeaderStyle === 'full' ? 'text-left' : 'text-left items-start';

  // Load Google Fonts
  useEffect(() => {
    const fontMap = {
      modern: 'Inter:wght@400;500;600;700',
      classic: 'Merriweather:wght@400;700',
      elegant: 'Playfair+Display:wght@400;500;600;700',
      playful: 'Nunito:wght@400;600;700',
      mono: 'JetBrains+Mono:wght@400;500;600',
    };
    const fontParam = fontMap[shopFont];
    if (fontParam) {
      const linkId = 'narucify-shop-font';
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
    }
  }, [shopFont]);

  useEffect(() => {
    localStorage.setItem('dm-order-public-lang', language);
  }, [language]);

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const fetchShop = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/shop/${shopId}`);
      setShop(response.data);
    } catch (err) {
      console.error('Error fetching shop:', err);
      setError('shopNotFound');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  // Wishlist helpers
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem(`narucify-wishlist-${shopId}`, JSON.stringify(next));
      toast.success(next.includes(productId) ? t('addedToWishlist') : t('removedFromWishlist'));
      return next;
    });
  };
  const isWishlisted = (productId) => wishlist.includes(productId);

  // Categories from products
  const categories = [...new Set((shop?.products || []).map(p => p.category).filter(Boolean))];

  // Filtered + sorted products
  const filteredProducts = (shop?.products || [])
    .filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
      return 0;
    });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
    toast.success(t('addedToCart'));
  };

  const updateQuantity = (productId, delta) => {
    const product = shop.products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, Math.min(product?.stock || 99, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (couponDiscount) {
      if (couponDiscount.discount_type === 'percent') {
        return Math.max(0, subtotal - subtotal * (couponDiscount.discount_value / 100));
      } else {
        return Math.max(0, subtotal - couponDiscount.discount_value);
      }
    }
    return subtotal;
  };
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address || !formData.city) {
      toast.error(language === 'sr' ? 'Popuni sva obavezna polja' : 'Fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const orderResponse = await axios.post(`${API_URL}/public/shop/${shopId}/order`, {
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
        customer: formData,
        coupon_code: couponDiscount ? couponCode : null
      });
      setOrderSuccess(orderResponse.data);
      setCart([]);
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(err.response?.data?.detail || (language === 'sr' ? 'Greška pri kreiranju porudžbine' : 'Error creating order'));
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header skeleton */}
        <div className="bg-white border-b border-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-36 bg-stone-200 rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-stone-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Products skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-4 w-24 bg-stone-200 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border border-stone-100 overflow-hidden shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="aspect-square bg-stone-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom text */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 text-stone-300 text-xs">
            <div className="w-3 h-3 rounded-full border border-stone-200 border-t-stone-400 animate-spin" />
            {t('loading')}
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{t(error)}</h1>
        </div>
      </div>
    );
  }

  const showWatermark = !shop?.is_pro;

  // Share product link helper
  const shareProduct = (product) => {
    const url = `${window.location.origin}/shop/${shopId}?p=${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `${product.name} - ${formatCurrency(product.price)}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t('linkCopied'));
    }
  };

  // Quick order — skip cart, go directly to checkout with 1 item
  const quickOrder = (product) => {
    setCart([{ ...product, quantity: 1 }]);
    setShowCheckout(true);
  };

  // ==================== VACATION MODE ====================
  if (shop?.shop_vacation_mode) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.successCard} rounded-2xl p-8 text-center`}>
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <PauseCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>{t('vacationTitle')}</h1>
          <p className={`${theme.textSecondary} mb-6`}>
            {shop.shop_vacation_message || t('vacationDefault')}
          </p>
          {/* Contact buttons even in vacation */}
          {(shop.shop_instagram || shop.shop_whatsapp || shop.shop_viber) && (
            <div className="flex justify-center gap-3">
              {shop.shop_instagram && (
                <a href={`https://instagram.com/${shop.shop_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {shop.shop_whatsapp && (
                <a href={`https://wa.me/${shop.shop_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
              {shop.shop_viber && (
                <a href={`viber://chat?number=${shop.shop_viber.replace(/[^0-9]/g,'')}`}
                  className={`w-10 h-10 rounded-full ${theme.accentLight} flex items-center justify-center hover:opacity-80 transition-opacity`}>
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
          {showWatermark && (
            <p className={`text-xs ${theme.watermarkText} mt-8`}>{t('poweredBy')}</p>
          )}
        </div>
      </div>
    );
  }

  // ==================== ORDER SUCCESS ====================
  if (orderSuccess) {
    return (
      <div className={`min-h-screen ${theme.successBg} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.successCard} rounded-2xl p-8 text-center`}>
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce-in">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>{t('orderSuccess')}</h1>
          <p className={`${theme.textSecondary} mb-6`}>{t('thankYou')}</p>
          <div className={`p-5 rounded-xl ${theme.sectionBg} border ${theme.divider} mb-6`}>
            <p className={`text-sm ${theme.textSecondary} mb-1`}>{t('orderNumber')}</p>
            <p className={`text-2xl font-bold ${theme.textPrimary} font-mono tracking-wider`}>
              {orderSuccess.order_number}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className={`flex-1 h-12 rounded-xl ${theme.btnOutline}`}
              onClick={() => { setOrderSuccess(null); setShowCheckout(false); }}
            >
              {t('continueShopping')}
            </Button>
            <Button 
              className={`flex-1 h-12 rounded-xl ${theme.accent}`}
              onClick={() => window.location.href = `/track/${orderSuccess.tracking_id}`}
            >
              {t('trackOrder')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== CHECKOUT ====================
  if (showCheckout && cart.length > 0) {
    return (
      <div className={`min-h-screen ${theme.checkoutBg}`} data-testid="checkout-page">
        <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-4`}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button 
              variant="ghost" size="icon"
              onClick={() => setShowCheckout(false)}
              className={`${theme.textSecondary} rounded-full`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className={`font-bold ${theme.textPrimary}`}>{t('backToShop')}</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 pb-8">
          <form onSubmit={handleSubmitOrder} className="space-y-5">

            {/* Order Summary */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <ShoppingCart className="w-4 h-4" />
                  {t('orderSummary')}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl overflow-hidden ${theme.imgPlaceholder} flex-shrink-0`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className={`w-6 h-6 ${theme.emptyIcon}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${theme.textPrimary} truncate`}>{item.name}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className={`font-semibold ${theme.textPrice}`}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className={`pt-4 border-t ${theme.divider} space-y-2`}>
                  {couponDiscount && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme.textSecondary}`}>{language === 'sr' ? 'Međuzbir' : 'Subtotal'}</span>
                        <span className={`text-sm ${theme.textSecondary}`}>{formatCurrency(getSubtotal())}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm">{language === 'sr' ? 'Popust' : 'Discount'} ({couponCode})</span>
                        <span className="text-sm">-{formatCurrency(getSubtotal() - getTotal())}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme.textPrimary}`}>{t('total')}</span>
                    <span className={`text-2xl font-bold ${theme.textPrice}`}>{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <MapPin className="w-4 h-4" />
                  {t('deliveryInfo')}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('fullName')} *</Label>
                  <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('phone')} *</Label>
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('address')} *</Label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={`text-sm ${theme.textSecondary}`}>{t('city')} *</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={`text-sm ${theme.textSecondary}`}>{t('postalCode')}</Label>
                    <Input value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={`text-sm ${theme.textSecondary}`}>{t('email')}</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`${theme.inputBg} h-11 rounded-xl`} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${theme.divider}`}>
                <h2 className={`font-semibold ${theme.textPrimary} flex items-center gap-2`}>
                  <CreditCard className="w-4 h-4" />
                  {t('paymentMethod')}
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${theme.radioBox} ${formData.payment_method === 'cash_on_delivery' ? 'ring-2 ring-offset-1 ring-black/10' : ''}`}>
                  <input type="radio" name="payment" value="cash_on_delivery" checked={formData.payment_method === 'cash_on_delivery'} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="accent-neutral-900" />
                  <span className={theme.textPrimary}>{t('cashOnDelivery')}</span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${theme.radioBox} ${formData.payment_method === 'bank_transfer' ? 'ring-2 ring-offset-1 ring-black/10' : ''}`}>
                  <input type="radio" name="payment" value="bank_transfer" checked={formData.payment_method === 'bank_transfer'} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="accent-neutral-900" />
                  <span className={theme.textPrimary}>{t('bankTransfer')}</span>
                </label>
                <label className="flex items-center gap-3 pt-3 cursor-pointer">
                  <Checkbox checked={formData.subscribe_promo} onCheckedChange={checked => setFormData({...formData, subscribe_promo: checked})} />
                  <span className={`text-sm ${theme.textSecondary}`}>{t('subscribePromo')}</span>
                </label>
              </div>
            </div>

            {/* Coupon Code */}
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} overflow-hidden`}>
              <div className="p-5">
                <p className={`text-sm font-medium ${theme.textPrimary} mb-3`}>
                  {language === 'sr' ? '🏷️ Kupon kod' : '🏷️ Coupon code'}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(null); }}
                    placeholder={language === 'sr' ? 'Unesi kod' : 'Enter code'}
                    className={`${theme.inputBg} h-11 rounded-xl uppercase`}
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 rounded-xl"
                    disabled={!couponCode || validatingCoupon}
                    onClick={async () => {
                      setValidatingCoupon(true);
                      try {
                        const res = await axios.post(`${API_URL}/public/shop/${shopId}/validate-coupon?code=${encodeURIComponent(couponCode)}`);
                        if (res.data.valid) {
                          setCouponDiscount(res.data);
                          toast.success(language === 'sr' ? 'Kupon primenjen!' : 'Coupon applied!');
                        }
                      } catch (err) {
                        setCouponDiscount(null);
                        toast.error(err.response?.data?.detail || (language === 'sr' ? 'Nevažeći kupon' : 'Invalid coupon'));
                      } finally {
                        setValidatingCoupon(false);
                      }
                    }}
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'sr' ? 'Primeni' : 'Apply')}
                  </Button>
                </div>
                {couponDiscount && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center justify-between">
                    <span>
                      {couponDiscount.discount_type === 'percent'
                        ? `${couponDiscount.discount_value}% ${language === 'sr' ? 'popusta' : 'off'}`
                        : `${formatCurrency(couponDiscount.discount_value)} ${language === 'sr' ? 'popusta' : 'off'}`}
                    </span>
                    <span className="font-semibold">
                      -{formatCurrency(getSubtotal() - getTotal())}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className={`w-full h-14 text-lg rounded-xl ${theme.accent} font-semibold`} disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Check className="w-5 h-5 mr-2" />{t('confirmOrder')} — {formatCurrency(getTotal())}</>
              )}
            </Button>
          </form>
        </main>

        {showWatermark && (
          <div className={`${theme.watermarkBg} py-2 text-center`}>
            <a href="/" className={`text-xs ${theme.watermarkText} hover:opacity-70 transition-opacity`}>{t('poweredBy')}</a>
          </div>
        )}
      </div>
    );
  }

  // ==================== SHARED: Announcement bar, About, Footer ====================
  const announcementBgColors = {
    default: theme.headerBg,
    red: 'bg-red-600',
    green: 'bg-emerald-600',
    blue: 'bg-blue-600',
    yellow: 'bg-amber-500',
    black: 'bg-black',
    purple: 'bg-purple-600',
  };

  const renderAnnouncement = () => {
    const text = shop?.shop_announcement;
    if (!text) return null;
    const bg = announcementBgColors[shop?.shop_announcement_bg] || announcementBgColors.default;
    return (
      <div className={`${bg} px-4 py-2 text-center`}>
        <p className="text-xs md:text-sm font-medium text-white">{text}</p>
      </div>
    );
  };

  const renderAboutSection = () => {
    const text = shop?.shop_about_text;
    if (!text) return null;
    return (
      <div className={`max-w-4xl mx-auto px-4 py-8`}>
        <div className={`${theme.cardBg} rounded-xl ${theme.cardBorder} border p-6 md:p-8`}>
          <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-3`} style={{ fontFamily }}>
            {language === 'sr' ? 'O nama' : 'About Us'}
          </h3>
          <p className={`text-sm leading-relaxed ${theme.textSecondary}`} style={{ fontFamily }}>{text}</p>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const text = shop?.shop_footer_text;
    return (
      <footer className={`${theme.headerBg} border-t ${theme.divider} px-4 py-6 mb-20`}>
        <div className="max-w-5xl mx-auto text-center space-y-2">
          {text && <p className={`text-xs ${theme.textSecondary}`} style={{ fontFamily }}>{text}</p>}
          <a href="/" className={`text-xs ${theme.watermarkText} hover:opacity-70 transition-opacity`}>{t('poweredBy')}</a>
        </div>
      </footer>
    );
  };

  // ==================== SHARED: Cart bar + watermark + styles ====================
  const renderCartBar = () => (
    <>
      {cart.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 ${theme.cartBg}`}>
          {cartOpen && (
            <div className={`border-b ${theme.divider} max-h-64 overflow-y-auto`}>
              <div className="max-w-5xl mx-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg overflow-hidden ${theme.imgPlaceholder} flex-shrink-0`}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center"><Package className={`w-4 h-4 ${theme.emptyIcon}`} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${theme.textPrimary} truncate`}>{item.name}</p>
                      <p className={`text-xs ${theme.textSecondary}`}>{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className={`font-semibold text-sm ${theme.textPrice}`}>{formatCurrency(item.price * item.quantity)}</p>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 rounded-full" onClick={() => removeFromCart(item.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => setCartOpen(!cartOpen)} className="flex items-center gap-3 cursor-pointer bg-transparent border-0">
              <div className="relative">
                <ShoppingCart className={`w-6 h-6 ${theme.cartIcon}`} />
                <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>
                  {getItemCount()}
                </span>
              </div>
              <div className="text-left">
                <p className={`text-sm ${theme.textSecondary}`}>{getItemCount()} {t('items')}</p>
                <p className={`text-lg font-bold ${theme.textPrimary}`}>{formatCurrency(getTotal())}</p>
              </div>
              <ChevronUp className={`w-4 h-4 ${theme.textSecondary} transition-transform ${cartOpen ? 'rotate-180' : ''}`} />
            </button>
            <Button className={`${theme.accent} px-8 h-12 rounded-xl text-base font-semibold`} onClick={() => setShowCheckout(true)}>
              {t('checkout')}
            </Button>
          </div>
        </div>
      )}
      {cart.length === 0 && (
        <div className={`fixed bottom-0 left-0 right-0 ${theme.watermarkBg} py-2.5 text-center`}>
          <a href="/" className={`text-xs ${theme.watermarkText} hover:opacity-70 transition-opacity`}>{t('poweredBy')}</a>
        </div>
      )}
    </>
  );

  const renderStyles = () => (
    <style>{`
      @keyframes catalogFadeIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
      @keyframes pingOnce {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .animate-ping-once { animation: pingOnce 0.6s ease-out; }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  );

  // Shared image render helper
  const renderProductImage = (product, customClass) => {
    const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
    const currentIdx = imageIndexes[product.id] || 0;
    const currentImg = images[currentIdx] || null;
    const hasMultiple = images.length > 1;
    return (
      <>
        {currentImg ? (
          <img src={currentImg} alt={product.name} className={customClass || "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"} />
        ) : (
          <div className={`w-full h-full ${theme.imgPlaceholder} flex items-center justify-center`}>
            <Package className={`w-12 h-12 ${theme.emptyIcon}`} />
          </div>
        )}
        {hasMultiple && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx - 1 + images.length) % images.length })); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx + 1) % images.length })); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: i })); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  // Shared badges helper
  const renderBadges = (product) => {
    const inCart = cart.find(item => item.id === product.id);
    return (
      <>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme.badgeOutOfStock}`}>{t('outOfStock')}</span>
          </div>
        )}
        {product.old_price && product.old_price > product.price && product.stock > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3" /> {t('onSale')}
          </div>
        )}
        {shop?.shop_show_low_stock && product.stock > 0 && product.stock <= 3 && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-lg">
            {t('lastItems').replace('{n}', product.stock)}
          </div>
        )}
        {inCart && (
          <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full ${theme.badge} flex items-center justify-center text-xs font-bold shadow-lg`}>
            {inCart.quantity}
          </div>
        )}
        {shop?.shop_show_share && !inCart && product.stock > 0 && (
          <button onClick={(e) => { e.stopPropagation(); shareProduct(product); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${isWishlisted(product.id) ? 'bg-red-500/80 text-white' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}>
          <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-white' : ''}`} />
        </button>
        {addedProductId === product.id && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-ping-once">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </>
    );
  };

  // Shared cart buttons helper
  const renderCartButtons = (product, compact) => {
    const inCart = cart.find(item => item.id === product.id);
    if (inCart) {
      return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className={`${compact ? 'h-8 w-8' : 'h-9 w-9'} p-0 ${theme.btnOutline}`}
            style={{ borderRadius: btnRadius }}
            onClick={() => { inCart.quantity <= 1 ? removeFromCart(product.id) : updateQuantity(product.id, -1); }}>
            {inCart.quantity <= 1 ? <X className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </Button>
          <span className={`flex-1 text-center ${theme.textPrimary} font-semibold text-sm`}>{inCart.quantity}</span>
          <Button size="sm" variant="outline" className={`${compact ? 'h-8 w-8' : 'h-9 w-9'} p-0 ${theme.btnOutline}`}
            style={{ borderRadius: btnRadius }}
            onClick={() => updateQuantity(product.id, 1)} disabled={inCart.quantity >= product.stock}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      );
    }
    return (
      <>
        <Button className={`w-full ${compact ? 'h-8 text-xs' : 'h-9 text-sm'} ${theme.accent} gap-1.5`} style={{ borderRadius: btnRadius }} size="sm" disabled={product.stock <= 0} onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
          <Plus className="w-3.5 h-3.5" />
          {t('addToOrder')}
        </Button>
        {shop?.shop_quick_order && product.stock > 0 && (
          <Button variant="outline" className={`w-full h-8 text-xs ${theme.btnOutline} gap-1`} style={{ borderRadius: btnRadius }} size="sm" onClick={(e) => { e.stopPropagation(); quickOrder(product); }}>
            <Zap className="w-3 h-3" />
            {t('orderNow')}
          </Button>
        )}
      </>
    );
  };

  // Get display products (shared across templates)
  const getDisplayProducts = () => {
    return selectedCategory === '__wishlist__'
      ? (shop?.products || []).filter(p => wishlist.includes(p.id))
      : filteredProducts;
  };

  // Shared search & filters
  const renderSearchFilters = () => (
    shop?.products?.length > 0 ? (
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('searchProducts')}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30`} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
            {t('allCategories')}
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{ val: 'default', label: t('sortDefault') }, { val: 'price_low', label: t('sortPriceLow') }, { val: 'price_high', label: t('sortPriceHigh') }, { val: 'newest', label: t('sortNewest') }].map(opt => (
            <button key={opt.val} onClick={() => setSortBy(opt.val)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === opt.val ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    ) : null
  );

  // ==================== PRODUCT DETAIL VIEW ====================
  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const product = selectedProduct;
    const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
    const currentIdx = imageIndexes[product.id] || 0;
    const inCart = cart.find(item => item.id === product.id);
    const otherProducts = (shop?.products || []).filter(p => p.id !== product.id).slice(0, 8);

    return (
      <div className={`min-h-screen ${theme.bg}`} style={{ fontFamily }} data-testid="product-detail-page">
        {renderAnnouncement()}
        <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-3`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(null); window.scrollTo(0, 0); }} className={`${theme.textSecondary} rounded-full`}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className={`font-bold ${theme.textPrimary} text-sm truncate`}>{t('backToProducts')}</h1>
            <div className="ml-auto flex items-center gap-2">
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary} rounded-full`}>
                  <ShoppingCart className="w-5 h-5" />
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>{getItemCount()}</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary} rounded-full`}>
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
          <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} ${cardClass} overflow-hidden`}>
            {/* Image gallery */}
            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-black/5">
              {images.length > 0 ? (
                <img src={images[currentIdx]} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className={`w-full h-full ${theme.imgPlaceholder} flex items-center justify-center`}>
                  <Package className={`w-16 h-16 ${theme.emptyIcon}`} />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx - 1 + images.length) % images.length }))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx + 1) % images.length }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImageIndexes(prev => ({ ...prev, [product.id]: i }))}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIdx ? 'bg-white w-5' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-1.5">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImageIndexes(prev => ({ ...prev, [product.id]: i }))}
                      className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${i === currentIdx ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Badges */}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme.badgeOutOfStock}`}>{t('outOfStock')}</span>
                </div>
              )}
              {product.old_price && product.old_price > product.price && product.stock > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {t('onSale')}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="p-5 md:p-8 space-y-4">
              {product.category && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${theme.accentLight}`}>{product.category}</span>
              )}
              <h2 className={`text-2xl md:text-3xl font-bold ${theme.textPrimary}`} style={{ fontFamily }}>{product.name}</h2>

              {/* Price section */}
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-bold ${product.old_price && product.old_price > product.price ? 'text-red-500' : theme.textPrice}`}>
                  {formatCurrency(product.price)}
                </span>
                {product.old_price && product.old_price > product.price && (
                  <span className={`text-lg ${theme.textSecondary} line-through`}>{formatCurrency(product.old_price)}</span>
                )}
              </div>

              {/* Stock info */}
              {product.stock > 0 && (
                <p className={`text-sm ${product.stock <= 3 ? 'text-amber-600 font-medium' : theme.textSecondary}`}>
                  {product.stock <= 3 ? t('lastItems').replace('{n}', product.stock) : `${t('inStock')} (${product.stock})`}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <div className={`pt-4 border-t ${theme.divider}`}>
                  <h3 className={`text-sm font-semibold ${theme.textPrimary} mb-2`}>{t('description')}</h3>
                  <p className={`${theme.textSecondary} text-sm leading-relaxed whitespace-pre-wrap`}>{product.description}</p>
                </div>
              )}

              {/* Cart buttons */}
              <div className="pt-4 space-y-2 max-w-sm">
                {renderCartButtons(product)}
              </div>

              {/* Share & Wishlist */}
              <div className="flex items-center gap-3 pt-2">
                {shop?.shop_show_share && (
                  <Button variant="outline" size="sm" className={`${theme.btnOutline} gap-1.5`} style={{ borderRadius: btnRadius }} onClick={() => shareProduct(product)}>
                    <Share2 className="w-4 h-4" /> {t('share')}
                  </Button>
                )}
                <Button variant="outline" size="sm" className={`${theme.btnOutline} gap-1.5 ${isWishlisted(product.id) ? 'text-red-500 border-red-200' : ''}`} style={{ borderRadius: btnRadius }} onClick={() => toggleWishlist(product.id)}>
                  <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-red-500' : ''}`} /> {t('wishlist')}
                </Button>
              </div>
            </div>
          </div>

          {/* Other products */}
          {otherProducts.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4`}>{t('otherProducts')}</h3>
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-3`}>
                {otherProducts.map((p, index) => {
                  const pInCart = cart.find(item => item.id === p.id);
                  return (
                    <div key={p.id} className={`group rounded-xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${cardClass} cursor-pointer transition-all duration-300`}
                      onClick={() => { setSelectedProduct(p); setImageIndexes(prev => ({ ...prev, [p.id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ animationDelay: `${index * 0.05}s`, animation: 'catalogFadeIn 0.4s ease-out forwards', opacity: 0 }}>
                      <div className="relative aspect-square overflow-hidden">
                        {renderProductImage(p)}
                        {pInCart && (
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full ${theme.badge} flex items-center justify-center text-[10px] font-bold shadow`}>
                            {pInCart.quantity}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className={`text-xs font-medium ${theme.textPrimary} line-clamp-2 mb-1`} style={{ fontFamily }}>{p.name}</h4>
                        <span className={`text-sm font-bold ${p.old_price && p.old_price > p.price ? 'text-red-500' : theme.textPrice}`}>
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {renderAboutSection()}
        {renderFooter()}
        {renderCartBar()}
        {renderStyles()}
      </div>
    );
  };

  // Product detail takes precedence over all templates
  if (selectedProduct) {
    return renderProductDetail();
  }

  // ==================== BOUTIQUE TEMPLATE ====================
  if (layout === 'boutique') {
    const displayProducts = getDisplayProducts();
    return (
      <div className={`min-h-screen ${theme.bg}`} style={{ fontFamily }} data-testid="mini-shop-page">
        {renderAnnouncement()}
        {/* Ultra-minimal centered header */}
        <header className={`${theme.headerBg} px-4 py-6 text-center`}>
          <div className="max-w-4xl mx-auto">
            {shop?.logo_url && (
              <img src={shop.logo_url} alt={shop.seller_name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-black/5" />
            )}
            <h1 className={`text-2xl md:text-3xl font-light tracking-wide ${theme.textPrimary} uppercase`}>
              {shop?.seller_name}
              {shop?.is_pro && <Crown className="w-4 h-4 text-amber-500 inline ml-2" />}
            </h1>
            {shop?.shop_description && (
              <p className={`${theme.textSecondary} mt-2 max-w-md mx-auto text-sm italic`}>{shop.shop_description}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              {shop?.shop_instagram && (
                <a href={`https://instagram.com/${shop.shop_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:opacity-70`}>
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {shop?.shop_whatsapp && (
                <a href={`https://wa.me/${shop.shop_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer" className={`${theme.textSecondary} hover:opacity-70`}>
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary}`}>
                  <ShoppingCart className="w-5 h-5" />
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>{getItemCount()}</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary}`}>
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured product - first product displayed large */}
        {displayProducts.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pt-8">
            <div className={`group rounded-3xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow} cursor-pointer`}
              style={{ animation: 'catalogFadeIn 0.4s ease-out forwards' }} onClick={() => { setSelectedProduct(displayProducts[0]); setImageIndexes(prev => ({ ...prev, [displayProducts[0].id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden">
                  {renderProductImage(displayProducts[0], "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700")}
                  {renderBadges(displayProducts[0])}
                </div>
                <div className={`p-6 md:p-10 flex flex-col justify-center`}>
                  <p className={`text-xs uppercase tracking-widest ${theme.textSecondary} mb-3`}>{t('featured') || (language === 'sr' ? 'Istaknuto' : 'Featured')}</p>
                  <h2 className={`text-2xl md:text-3xl font-light ${theme.textPrimary} mb-3`}>{displayProducts[0].name}</h2>
                  {displayProducts[0].description && (
                    <p className={`${theme.textSecondary} text-sm mb-4 leading-relaxed`}>{displayProducts[0].description}</p>
                  )}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className={`text-2xl font-bold ${displayProducts[0].old_price && displayProducts[0].old_price > displayProducts[0].price ? 'text-red-500' : theme.textPrice}`}>
                      {formatCurrency(displayProducts[0].price)}
                    </span>
                    {displayProducts[0].old_price && displayProducts[0].old_price > displayProducts[0].price && (
                      <span className={`text-sm ${theme.textSecondary} line-through`}>{formatCurrency(displayProducts[0].old_price)}</span>
                    )}
                  </div>
                  <div className="space-y-2 max-w-xs">
                    {renderCartButtons(displayProducts[0])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of products */}
        <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
          <div className={`h-px ${theme.divider} border-t mb-8`} />
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm uppercase tracking-widest ${theme.textSecondary}`}>{t('allProducts')}</h3>
            {wishlist.length > 0 && (
              <button onClick={() => setSelectedCategory('__wishlist__')} className={`flex items-center gap-1.5 text-sm ${selectedCategory === '__wishlist__' ? 'text-red-400' : theme.textSecondary}`}>
                <Heart className={`w-4 h-4 ${selectedCategory === '__wishlist__' ? 'fill-red-400' : ''}`} /> {wishlist.length}
              </button>
            )}
          </div>
          {renderSearchFilters()}
          <div className="grid grid-cols-2 gap-6">
            {(displayProducts.length > 1 ? displayProducts.slice(1) : displayProducts).map((product, index) => (
              <div key={product.id} className={`group rounded-2xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${cardClass} cursor-pointer transition-all duration-300`}
                style={{ animationDelay: `${index * 0.08}s`, animation: 'catalogFadeIn 0.4s ease-out forwards', opacity: 0 }}
                onClick={() => { setSelectedProduct(product); setImageIndexes(prev => ({ ...prev, [product.id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {renderProductImage(product)}
                  {renderBadges(product)}
                </div>
                <div className="p-4">
                  <h3 className={`font-light ${theme.textPrimary} text-sm tracking-wide mb-1 line-clamp-1`} style={{ fontFamily }}>{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-base font-semibold ${product.old_price && product.old_price > product.price ? 'text-red-500' : theme.textPrice}`}>
                      {formatCurrency(product.price)}
                    </span>
                    {product.old_price && product.old_price > product.price && (
                      <span className={`text-xs ${theme.textSecondary} line-through`}>{formatCurrency(product.old_price)}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">{renderCartButtons(product)}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
        {renderAboutSection()}
        {renderFooter()}
        {renderCartBar()}
        {renderStyles()}
      </div>
    );
  }

  // ==================== SHOWCASE TEMPLATE ====================
  if (layout === 'showcase') {
    const displayProducts = getDisplayProducts();
    return (
      <div className={`min-h-screen ${theme.bg}`} style={{ fontFamily }} data-testid="mini-shop-page">
        {renderAnnouncement()}
        {/* Slim top bar */}
        <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-2`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {shop?.logo_url && <img src={shop.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
              <span className={`font-semibold text-sm ${theme.textPrimary}`}>{shop?.seller_name}</span>
              {shop?.is_pro && <Crown className="w-3.5 h-3.5 text-amber-500" />}
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary} h-8 w-8 p-0`}>
                  <ShoppingCart className="w-4 h-4" />
                  <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full ${theme.badge} text-[9px] flex items-center justify-center font-bold`}>{getItemCount()}</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary} h-8 w-8 p-0`}>
                <Globe className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Gallery-style full-bleed product grid */}
        <main className="max-w-6xl mx-auto px-2 md:px-4 py-4 pb-32">
          <div className="px-2 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs ${theme.textSecondary}`}>{shop?.products?.length || 0} {t('products').toLowerCase()}</p>
              {wishlist.length > 0 && (
                <button onClick={() => setSelectedCategory('__wishlist__')} className={`flex items-center gap-1 text-xs ${selectedCategory === '__wishlist__' ? 'text-red-400' : theme.textSecondary}`}>
                  <Heart className={`w-3 h-3 ${selectedCategory === '__wishlist__' ? 'fill-red-400' : ''}`} /> {wishlist.length}
                </button>
              )}
            </div>
            {renderSearchFilters()}
          </div>

          {/* Masonry-style bento grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3">
            {displayProducts.map((product, index) => {
              const isLarge = index % 5 === 0;
              return (
                <div key={product.id} className={`group relative mb-2 md:mb-3 rounded-xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${cardClass} cursor-pointer break-inside-avoid transition-all duration-300`}
                  style={{ animationDelay: `${index * 0.05}s`, animation: 'catalogFadeIn 0.4s ease-out forwards', opacity: 0 }}
                  onClick={() => { setSelectedProduct(product); setImageIndexes(prev => ({ ...prev, [product.id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <div className={`relative ${isLarge ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden`}>
                    {renderProductImage(product)}
                    {renderBadges(product)}
                    {/* Hover overlay with info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2" style={{ fontFamily }}>{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-bold text-white`}>{formatCurrency(product.price)}</span>
                        {product.stock > 0 && (
                          <Button size="sm" className="h-8 w-8 p-0 bg-white text-black hover:bg-white/90" style={{ borderRadius: btnRadius }} onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Always visible minimal info below image */}
                  <div className="p-2">
                    <p className={`text-xs ${theme.textPrimary} line-clamp-1`} style={{ fontFamily }}>{product.name}</p>
                    <p className={`text-xs font-semibold ${theme.textPrice}`}>{formatCurrency(product.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {displayProducts.length === 0 && (
            <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} ${theme.cardShadow} py-12 text-center`}>
              <Search className={`w-10 h-10 ${theme.emptyIcon} mx-auto mb-3`} />
              <p className={`text-sm ${theme.textSecondary}`}>{t('noResults')}</p>
            </div>
          )}
        </main>
        {renderAboutSection()}
        {renderFooter()}
        {renderCartBar()}
        {renderStyles()}
      </div>
    );
  }

  // ==================== STOREFRONT TEMPLATE ====================
  if (layout === 'storefront') {
    const displayProducts = getDisplayProducts();
    return (
      <div className={`min-h-screen ${theme.bg}`} style={{ fontFamily }} data-testid="mini-shop-page">
        {renderAnnouncement()}
        {/* Full-width header with integrated search */}
        <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-3`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                {shop?.logo_url ? (
                  <img src={shop.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className={`w-9 h-9 rounded-lg ${theme.accent} flex items-center justify-center`}>
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className={`font-bold ${theme.textPrimary} hidden md:block`}>{shop?.seller_name}</span>
              </div>
              {/* Integrated search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('searchProducts')}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} text-sm focus:outline-none`} />
              </div>
              <div className="flex items-center gap-1">
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary}`}>
                    <ShoppingCart className="w-5 h-5" />
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>{getItemCount()}</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary}`}>
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Category horizontal nav */}
            {categories.length > 0 && (
              <div className={`flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-hide border-t ${theme.divider} pt-2`}>
                <button onClick={() => setSelectedCategory('')} className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${!selectedCategory ? theme.accent : `${theme.textSecondary} hover:${theme.textPrimary}`}`}>
                  {t('allCategories')}
                </button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${selectedCategory === cat ? theme.accent : `${theme.textSecondary} hover:${theme.textPrimary}`}`}>
                    {cat}
                  </button>
                ))}
                {wishlist.length > 0 && (
                  <button onClick={() => setSelectedCategory('__wishlist__')} className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1 ${selectedCategory === '__wishlist__' ? 'bg-red-500 text-white' : `${theme.textSecondary}`}`}>
                    <Heart className={`w-3 h-3 ${selectedCategory === '__wishlist__' ? 'fill-white' : ''}`} /> {wishlist.length}
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Promo banner if description exists */}
        {shop?.shop_description && (
          <div className={`${theme.heroBg} px-4 py-3 text-center`}>
            <p className={`text-sm ${theme.heroText}`}>{shop.shop_description}</p>
          </div>
        )}

        {/* Sort bar */}
        <div className={`${theme.sectionBg} px-4 py-2 border-b ${theme.divider}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className={`text-xs ${theme.textSecondary}`}>{displayProducts.length} {t('products').toLowerCase()}</p>
            <div className="flex gap-1">
              {[{ val: 'default', label: t('sortDefault') }, { val: 'price_low', label: '↑ ' + t('price') }, { val: 'price_high', label: '↓ ' + t('price') }].map(opt => (
                <button key={opt.val} onClick={() => setSortBy(opt.val)} className={`px-2 py-1 rounded text-xs ${sortBy === opt.val ? theme.accent : theme.textSecondary}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dense product grid */}
        <main className="max-w-7xl mx-auto px-4 py-4 pb-32">
          {displayProducts.length === 0 ? (
            <div className={`${theme.cardBg} rounded-xl ${theme.cardBorder} py-12 text-center`}>
              <Search className={`w-10 h-10 ${theme.emptyIcon} mx-auto mb-3`} />
              <p className={`text-sm ${theme.textSecondary}`}>{t('noResults')}</p>
            </div>
          ) : (
            <div className={`grid ${gridColsClass} gap-3`}>
              {displayProducts.map((product, index) => (
                <div key={product.id} className={`group rounded-lg overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${cardClass} cursor-pointer transition-all duration-200`}
                  style={{ animationDelay: `${index * 0.03}s`, animation: 'catalogFadeIn 0.3s ease-out forwards', opacity: 0 }}
                  onClick={() => { setSelectedProduct(product); setImageIndexes(prev => ({ ...prev, [product.id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <div className="relative aspect-square overflow-hidden">
                    {renderProductImage(product)}
                    {renderBadges(product)}
                  </div>
                  <div className="p-2.5">
                    <h3 className={`font-medium ${theme.textPrimary} text-xs leading-tight mb-1 line-clamp-2`} style={{ fontFamily }}>{product.name}</h3>
                    {product.description && shopShowDesc && (
                      <p className={`text-[10px] ${theme.textSecondary} line-clamp-1 mb-1`}>{product.description}</p>
                    )}
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-sm font-bold ${product.old_price && product.old_price > product.price ? 'text-red-500' : theme.textPrice}`}>
                        {formatCurrency(product.price)}
                      </span>
                      {product.old_price && product.old_price > product.price && (
                        <span className={`text-[10px] ${theme.textSecondary} line-through`}>{formatCurrency(product.old_price)}</span>
                      )}
                    </div>
                    <div className="space-y-1">{renderCartButtons(product, true)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        {renderAboutSection()}
        {renderFooter()}
        {renderCartBar()}
        {renderStyles()}
      </div>
    );
  }

  // ==================== MAIN CATALOG ====================
  return (
    <div className={`min-h-screen ${theme.bg}`} style={{ fontFamily }} data-testid="mini-shop-page">
      {renderAnnouncement()}

      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.headerBg} px-4 py-3`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt={shop.seller_name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-black/5" />
            ) : (
              <div className={`w-10 h-10 rounded-xl ${theme.accent} flex items-center justify-center`}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className={`font-bold ${theme.textPrimary} flex items-center gap-2`}>
                {shop?.seller_name}
                {shop?.is_pro && <Crown className="w-4 h-4 text-amber-500" />}
              </h1>
              <p className={`text-xs ${theme.textSecondary}`}>{t('catalog')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCartOpen(!cartOpen)} className={`relative ${theme.textPrimary} rounded-full`}>
                <ShoppingCart className="w-5 h-5" />
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${theme.badge} text-[10px] flex items-center justify-center font-bold`}>
                  {getItemCount()}
                </span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLanguage(l => l === 'en' ? 'sr' : 'en')} className={`${theme.textSecondary} rounded-full`}>
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {shopHeroStyle === 'banner' && (
      <div className={`${theme.heroBg} px-4 py-12 md:py-16`}>
        <div className={`max-w-5xl mx-auto ${headerAlign === 'text-center items-center' ? 'text-center' : ''}`}>
          {shop?.shop_banner_url && (
            <div className="mb-6 rounded-2xl overflow-hidden max-h-48 md:max-h-64">
              <img src={shop.shop_banner_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.heroText} mb-3`} style={{ fontFamily }}>
            {shop?.seller_name}
          </h2>
          <p className={`${theme.heroSub} max-w-lg ${headerAlign === 'text-center items-center' ? 'mx-auto' : ''} text-base md:text-lg`} style={{ fontFamily }}>
            {shop?.shop_description || t('browseProducts')}
          </p>
          <div className={`mt-6 flex flex-wrap ${headerAlign === 'text-center items-center' ? 'justify-center' : ''} gap-3`}>
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${theme.accentLight}`} style={{ borderRadius: btnRadius }}>
              <Package className="w-4 h-4" />
              {shop?.products?.length || 0} {t('products').toLowerCase()}
            </span>
            {shop?.shop_instagram && (
              <a href={`https://instagram.com/${shop.shop_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`} style={{ borderRadius: btnRadius }}>
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {shop?.shop_whatsapp && (
              <a href={`https://wa.me/${shop.shop_whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`} style={{ borderRadius: btnRadius }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {shop?.shop_viber && (
              <a href={`viber://chat?number=${shop.shop_viber.replace(/[^0-9]/g,'')}`}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${theme.accentLight} hover:opacity-80 transition-opacity`} style={{ borderRadius: btnRadius }}>
                <Phone className="w-4 h-4" /> Viber
              </a>
            )}
          </div>
        </div>
      </div>
      )}
      {shopHeroStyle === 'minimal' && (
      <div className={`${theme.heroBg} px-4 py-6`}>
        <div className={`max-w-5xl mx-auto flex ${headerAlign === 'text-center items-center' ? 'flex-col items-center' : 'items-center gap-4'}`}>
          {shop?.logo_url && <img src={shop.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />}
          <div className={headerAlign === 'text-center items-center' ? 'text-center mt-2' : ''}>
            <h2 className={`text-xl font-bold ${theme.heroText}`} style={{ fontFamily }}>{shop?.seller_name}</h2>
            {shop?.shop_description && <p className={`text-sm ${theme.heroSub}`} style={{ fontFamily }}>{shop.shop_description}</p>}
          </div>
        </div>
      </div>
      )}

      {/* Products */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>{t('allProducts')}</h3>
          {wishlist.length > 0 && (
            <button onClick={() => setSelectedCategory('__wishlist__')} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors ${selectedCategory === '__wishlist__' ? 'bg-red-500/20 text-red-400' : `${theme.textSecondary} hover:${theme.textPrimary}`}`}>
              <Heart className={`w-4 h-4 ${selectedCategory === '__wishlist__' ? 'fill-red-400' : ''}`} />
              {t('wishlist')} ({wishlist.length})
            </button>
          )}
        </div>

        {/* Search & Filters */}
        {shop?.products?.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchProducts')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 placeholder:${theme.textSecondary}`}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
                {t('allCategories')}
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { val: 'default', label: t('sortDefault') },
                { val: 'price_low', label: t('sortPriceLow') },
                { val: 'price_high', label: t('sortPriceHigh') },
                { val: 'newest', label: t('sortNewest') },
              ].map(opt => (
                <button key={opt.val} onClick={() => setSortBy(opt.val)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sortBy === opt.val ? 'bg-orange-500 text-white' : `${theme.cardBg} ${theme.cardBorder} border ${theme.textSecondary}`}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {shop?.products?.length === 0 ? (
          <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} ${theme.cardShadow}`}>
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`w-24 h-24 rounded-full ${theme.imgPlaceholder} flex items-center justify-center mb-6`}>
                <Package className={`w-12 h-12 ${theme.emptyIcon}`} />
              </div>
              <p className={`text-xl font-medium ${theme.textPrimary} mb-2`}>{t('noProducts')}</p>
              <p className={theme.textSecondary}>{t('noProductsDesc')}</p>
            </div>
          </div>
        ) : (
          <>
          {(() => {
            const displayProducts = selectedCategory === '__wishlist__'
              ? (shop?.products || []).filter(p => wishlist.includes(p.id))
              : filteredProducts;
            return displayProducts.length === 0 ? (
              <div className={`${theme.cardBg} rounded-2xl ${theme.cardBorder} ${theme.cardShadow}`}>
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className={`w-10 h-10 ${theme.emptyIcon} mb-3`} />
                  <p className={`text-sm ${theme.textSecondary}`}>{t('noResults')}</p>
                </div>
              </div>
            ) : (
              <div className={
                layout === 'modern' ? 'grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6' :
                layout === 'list' ? 'flex flex-col gap-3 md:gap-4' :
                layout === 'magazine' ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5' :
                `grid ${gridColsClass} gap-4 md:gap-5`
              }>
                {displayProducts.map((product, index) => {
              const inCart = cart.find(item => item.id === product.id);
              const justAdded = addedProductId === product.id;
              const isFeatured = layout === 'magazine' && index === 0;
              return (
                <div
                  key={product.id}
                  className={`group ${layout === 'list' ? 'flex rounded-xl' : 'rounded-2xl'} overflow-hidden ${theme.cardBg} ${theme.cardBorder} ${cardClass} cursor-pointer transition-all duration-300 ${isFeatured ? 'col-span-2 md:col-span-3' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s`, animation: 'catalogFadeIn 0.4s ease-out forwards', opacity: 0 }}
                  onClick={() => { setSelectedProduct(product); setImageIndexes(prev => ({ ...prev, [product.id]: 0 })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${
                    layout === 'list' ? 'w-28 md:w-40 flex-shrink-0 aspect-square' :
                    layout === 'modern' ? 'aspect-[3/4]' :
                    isFeatured ? 'aspect-[2/1] md:aspect-[3/1]' :
                    'aspect-square'
                  }`}>
                    {(() => {
                      const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
                      const currentIdx = imageIndexes[product.id] || 0;
                      const currentImg = images[currentIdx] || null;
                      const hasMultiple = images.length > 1;
                      return (
                        <>
                          {currentImg ? (
                            <img src={currentImg} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className={`w-full h-full ${theme.imgPlaceholder} flex items-center justify-center`}>
                              <Package className={`w-12 h-12 ${theme.emptyIcon}`} />
                            </div>
                          )}
                          {hasMultiple && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx - 1 + images.length) % images.length })); }}
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: (currentIdx + 1) % images.length })); }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_, i) => (
                                  <button key={i} onClick={(e) => { e.stopPropagation(); setImageIndexes(prev => ({ ...prev, [product.id]: i })); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-white w-3' : 'bg-white/50'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme.badgeOutOfStock}`}>{t('outOfStock')}</span>
                      </div>
                    )}
                    {/* Sale badge */}
                    {product.old_price && product.old_price > product.price && product.stock > 0 && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {t('onSale')}
                      </div>
                    )}
                    {/* Low stock badge */}
                    {shop?.shop_show_low_stock && product.stock > 0 && product.stock <= 3 && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-lg">
                        {t('lastItems').replace('{n}', product.stock)}
                      </div>
                    )}
                    {inCart && (
                      <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full ${theme.badge} flex items-center justify-center text-xs font-bold shadow-lg`}>
                        {inCart.quantity}
                      </div>
                    )}
                    {/* Share button */}
                    {shop?.shop_show_share && !inCart && product.stock > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); shareProduct(product); }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Wishlist heart */}
                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${isWishlisted(product.id) ? 'bg-red-500/80 text-white' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}>
                      <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-white' : ''}`} />
                    </button>
                    {justAdded && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-ping-once">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={`p-3.5 ${layout === 'list' ? 'flex-1 flex flex-col justify-center min-w-0' : ''}`}>
                    <h3 className={`font-medium ${theme.textPrimary} ${layout === 'modern' || isFeatured ? 'text-base md:text-lg' : 'text-sm'} leading-tight mb-1.5 line-clamp-2`} title={product.name}>
                      {product.name}
                    </h3>
                    {product.description && shopShowDesc && (
                      <p className={`text-xs ${theme.textSecondary} line-clamp-2 mb-2`}>{product.description}</p>
                    )}
                    {/* Price with sale support */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className={`text-lg font-bold ${product.old_price && product.old_price > product.price ? 'text-red-500' : theme.textPrice}`}>
                        {formatCurrency(product.price)}
                      </p>
                      {product.old_price && product.old_price > product.price && (
                        <p className={`text-xs ${theme.textSecondary} line-through`}>{formatCurrency(product.old_price)}</p>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      {inCart ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" className={`h-9 w-9 p-0 ${theme.btnOutline}`}
                            style={{ borderRadius: btnRadius }}
                            onClick={() => { inCart.quantity <= 1 ? removeFromCart(product.id) : updateQuantity(product.id, -1); }}>
                            {inCart.quantity <= 1 ? <X className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          </Button>
                          <span className={`flex-1 text-center ${theme.textPrimary} font-semibold text-sm`}>{inCart.quantity}</span>
                          <Button size="sm" variant="outline" className={`h-9 w-9 p-0 ${theme.btnOutline}`}
                            style={{ borderRadius: btnRadius }}
                            onClick={() => updateQuantity(product.id, 1)} disabled={inCart.quantity >= product.stock}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button className={`w-full h-9 text-sm ${theme.accent} gap-1.5`} style={{ borderRadius: btnRadius }} size="sm" disabled={product.stock <= 0} onClick={() => addToCart(product)}>
                            <Plus className="w-3.5 h-3.5" />
                            {t('addToOrder')}
                          </Button>
                          {shop?.shop_quick_order && product.stock > 0 && (
                            <Button variant="outline" className={`w-full h-8 text-xs ${theme.btnOutline} gap-1`} style={{ borderRadius: btnRadius }} size="sm" onClick={() => quickOrder(product)}>
                              <Zap className="w-3 h-3" />
                              {t('orderNow')}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            );
          })()}
          </>
        )}
      </main>

      {renderAboutSection()}
      {renderFooter()}
      {renderCartBar()}
      {renderStyles()}
    </div>
  );
}
