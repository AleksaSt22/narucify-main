import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    businessName: 'Business Name',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    
    // Navigation
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard
    welcome: 'Welcome',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    completedOrders: 'Completed',
    totalRevenue: 'Total Revenue',
    totalProducts: 'Products',
    lowStock: 'Low Stock',
    totalCustomers: 'Customers',
    recentOrders: 'Recent Orders',
    
    // Products
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    productName: 'Product Name',
    description: 'Description',
    price: 'Price',
    stock: 'Stock',
    imageUrl: 'Image URL',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    noProducts: 'No products yet',
    addFirstProduct: 'Add your first product to get started',
    productAdded: 'Product added successfully',
    productUpdated: 'Product updated successfully',
    productDeleted: 'Product deleted successfully',
    
    // Orders
    createOrder: 'Create Order',
    orderNumber: 'Order #',
    customer: 'Customer',
    total: 'Total',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    noOrders: 'No orders yet',
    selectProducts: 'Select Products',
    quantity: 'Quantity',
    addToOrder: 'Add to Order',
    removeFromOrder: 'Remove',
    orderNotes: 'Order Notes',
    generateLink: 'Generate Link',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied to clipboard!',
    orderCreated: 'Order created successfully',
    viewOrder: 'View Order',
    updateStatus: 'Update Status',
    statusUpdated: 'Status updated',
    
    // Order Statuses
    pending_customer: 'Awaiting Customer',
    new: 'New',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    completed: 'Completed',
    canceled: 'Canceled',
    
    // Public Order Page
    orderSummary: 'Order Summary',
    yourDetails: 'Your Details',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    emailOptional: 'Email (optional)',
    subscribePromo: 'I want to receive promotions',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    bankTransfer: 'Bank Transfer',
    confirmOrder: 'Confirm Order',
    orderConfirmed: 'Order Confirmed!',
    thankYou: 'Thank you for your order',
    orderNumberIs: 'Your order number is',
    weWillContact: 'We will contact you shortly',
    backToSeller: 'Back',
    
    // Customers
    noCustomers: 'No customers yet',
    customerName: 'Name',
    customerPhone: 'Phone',
    customerEmail: 'Email',
    ordersCount: 'Orders',
    
    // Settings
    language: 'Language',
    english: 'English',
    serbian: 'Serbian',
    profile: 'Profile',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    currency: 'RSD',
    items: 'items',
    item: 'item',
    
    // Quick Order
    quickOrder: 'Quick Order',
    quickOrderDesc: 'Generate link for single product',
    
    // Moja Ponuda (Storefront)
    addToStorefront: 'Add to My Offer',
    removeFromStorefront: 'Remove from Offer',
    inStorefront: 'In Offer',
    storefrontProducts: 'Products in Offer',
    maxStorefrontProducts: 'Maximum 10 products in offer',
    myOffer: 'My Offer',
    myOfferDesc: 'Share your offer link on social media (up to 10 products free)',
    productsInOffer: 'Products in offer',
    noProductsInOffer: 'No products in offer. Add them on Products page.',
    
    // Delivery
    expectedDelivery: 'Expected Delivery',
    deliveryDays: 'days',
    updateDelivery: 'Update Delivery Time',
    
    // Badges
    badgeEarned: 'New Badge Earned!',
    congratulations: 'Congratulations',
    fromDMOrder: 'from Narucify team',
    
    // Locked Features
    lockedFeatures: 'Coming Soon',
    analytics: 'Analytics',
    analyticsDesc: 'Order statistics, revenue tracking, best sellers',
    finances: 'Finances',
    financesDesc: 'Income tracking, expenses, profit calculator',
    customerManagement: 'Customer Management',
    customerManagementDesc: 'Purchase history, segmentation',
    emailMarketing: 'Email Marketing',
    emailMarketingDesc: 'Save opt-in emails, export list',
    unlockFeature: 'Unlock',
    comingSoon: 'Coming Soon',

    // Export
    exportCSV: 'Export CSV',
    exportOrders: 'Export Orders',
    exportCustomers: 'Export Customers',

    // Email Verification
    checkYourEmail: 'Check Your Email',
    verificationEmailSent: 'We sent a verification link to',
    clickLinkToVerify: 'Click the link in the email to activate your account.',
    didntReceiveEmail: "Didn't receive the email?",
    resendVerification: 'Resend verification email',
    verificationResent: 'Verification email resent!',
    emailNotVerified: 'Email not verified. Please check your inbox.',
    emailVerified: 'Email verified successfully!',
    verifyingEmail: 'Verifying your email...',
    verificationExpired: 'Verification link expired or invalid.',
    requestNewLink: 'Request a new verification link',
    backToLogin: 'Back to Login',
    verificationFailed: 'Verification failed',
  },
  sr: {
    // Auth
    login: 'Prijava',
    register: 'Registracija',
    email: 'Email',
    password: 'Lozinka',
    businessName: 'Naziv biznisa',
    createAccount: 'Kreiraj nalog',
    alreadyHaveAccount: 'Već imaš nalog?',
    dontHaveAccount: 'Nemaš nalog?',
    loginSuccess: 'Uspešna prijava',
    registerSuccess: 'Uspešna registracija',
    
    // Navigation
    dashboard: 'Početna',
    products: 'Proizvodi',
    orders: 'Porudžbine',
    customers: 'Kupci',
    settings: 'Podešavanja',
    logout: 'Odjava',
    
    // Dashboard
    welcome: 'Dobrodošli',
    totalOrders: 'Ukupno porudžbina',
    pendingOrders: 'Na čekanju',
    completedOrders: 'Završeno',
    totalRevenue: 'Ukupan prihod',
    totalProducts: 'Proizvodi',
    lowStock: 'Malo na stanju',
    totalCustomers: 'Kupci',
    recentOrders: 'Nedavne porudžbine',
    
    // Products
    addProduct: 'Dodaj proizvod',
    editProduct: 'Izmeni proizvod',
    productName: 'Naziv proizvoda',
    description: 'Opis',
    price: 'Cena',
    stock: 'Na stanju',
    imageUrl: 'URL slike',
    save: 'Sačuvaj',
    cancel: 'Otkaži',
    delete: 'Obriši',
    noProducts: 'Nema proizvoda',
    addFirstProduct: 'Dodaj prvi proizvod da počneš',
    productAdded: 'Proizvod uspešno dodat',
    productUpdated: 'Proizvod uspešno ažuriran',
    productDeleted: 'Proizvod uspešno obrisan',
    
    // Orders
    createOrder: 'Kreiraj porudžbinu',
    orderNumber: 'Porudžbina #',
    customer: 'Kupac',
    total: 'Ukupno',
    status: 'Status',
    date: 'Datum',
    actions: 'Akcije',
    noOrders: 'Nema porudžbina',
    selectProducts: 'Izaberi proizvode',
    quantity: 'Količina',
    addToOrder: 'Dodaj',
    removeFromOrder: 'Ukloni',
    orderNotes: 'Napomena',
    generateLink: 'Generiši link',
    copyLink: 'Kopiraj link',
    linkCopied: 'Link kopiran!',
    orderCreated: 'Porudžbina kreirana',
    viewOrder: 'Pogledaj',
    updateStatus: 'Promeni status',
    statusUpdated: 'Status ažuriran',
    
    // Order Statuses
    pending_customer: 'Čeka kupca',
    new: 'Nova',
    confirmed: 'Potvrđena',
    shipped: 'Poslata',
    completed: 'Završena',
    canceled: 'Otkazana',
    
    // Public Order Page
    orderSummary: 'Pregled porudžbine',
    yourDetails: 'Tvoji podaci',
    fullName: 'Ime i prezime',
    phone: 'Broj telefona',
    address: 'Adresa',
    city: 'Grad',
    postalCode: 'Poštanski broj',
    emailOptional: 'Email (opciono)',
    subscribePromo: 'Želim da primam promocije',
    paymentMethod: 'Način plaćanja',
    cashOnDelivery: 'Pouzeće',
    bankTransfer: 'Uplata na račun',
    confirmOrder: 'Potvrdi porudžbinu',
    orderConfirmed: 'Porudžbina potvrđena!',
    thankYou: 'Hvala na porudžbini',
    orderNumberIs: 'Broj tvoje porudžbine je',
    weWillContact: 'Uskoro ćemo te kontaktirati',
    backToSeller: 'Nazad',
    
    // Customers
    noCustomers: 'Nema kupaca',
    customerName: 'Ime',
    customerPhone: 'Telefon',
    customerEmail: 'Email',
    ordersCount: 'Porudžbine',
    
    // Settings
    language: 'Jezik',
    english: 'Engleski',
    serbian: 'Srpski',
    profile: 'Profil',
    
    // Common
    loading: 'Učitavanje...',
    error: 'Greška',
    success: 'Uspešno',
    confirm: 'Potvrdi',
    search: 'Pretraga',
    filter: 'Filter',
    all: 'Sve',
    currency: 'RSD',
    items: 'artikala',
    item: 'artikal',
    
    // Quick Order
    quickOrder: 'Brza porudžbina',
    quickOrderDesc: 'Generiši link za jedan proizvod',
    
    // Moja Ponuda (Storefront)
    addToStorefront: 'Dodaj u ponudu',
    removeFromStorefront: 'Ukloni iz ponude',
    inStorefront: 'U ponudi',
    storefrontProducts: 'Proizvodi u ponudi',
    maxStorefrontProducts: 'Maksimum 10 proizvoda u ponudi',
    myOffer: 'Moja Ponuda',
    myOfferDesc: 'Podeli link svoje ponude na društvenim mrežama (do 10 proizvoda besplatno)',
    productsInOffer: 'Proizvodi u ponudi',
    noProductsInOffer: 'Nema proizvoda u ponudi. Dodaj ih na stranici Proizvodi.',
    
    // Delivery
    expectedDelivery: 'Očekivana dostava',
    deliveryDays: 'dana',
    updateDelivery: 'Ažuriraj vreme dostave',
    
    // Badges
    badgeEarned: 'Novi bedž osvojen!',
    congratulations: 'Čestitamo',
    fromDMOrder: 'od Narucify tima',
    
    // Locked Features
    lockedFeatures: 'Uskoro dostupno',
    analytics: 'Analitika',
    analyticsDesc: 'Statistika porudžbina, praćenje prihoda, najprodavaniji',
    finances: 'Finansije',
    financesDesc: 'Praćenje prihoda, rashodi, profit kalkulator',
    customerManagement: 'Upravljanje kupcima',
    customerManagementDesc: 'Istorija kupovina, segmentacija',
    emailMarketing: 'Email marketing',
    emailMarketingDesc: 'Čuvanje email opt-in korisnika, export liste',
    unlockFeature: 'Otključaj',
    comingSoon: 'Uskoro',

    // Export
    exportCSV: 'Export CSV',
    exportOrders: 'Export porudžbina',
    exportCustomers: 'Export kupaca',

    // Email Verification
    checkYourEmail: 'Proveri email',
    verificationEmailSent: 'Poslali smo verifikacioni link na',
    clickLinkToVerify: 'Klikni na link u emailu da aktiviraš nalog.',
    didntReceiveEmail: 'Nisi dobio/la email?',
    resendVerification: 'Ponovo pošalji verifikacioni email',
    verificationResent: 'Verifikacioni email ponovo poslat!',
    emailNotVerified: 'Email nije verifikovan. Proveri inbox.',
    emailVerified: 'Email uspešno verifikovan!',
    verifyingEmail: 'Verifikujemo tvoj email...',
    verificationExpired: 'Verifikacioni link je istekao ili je nevažeći.',
    requestNewLink: 'Zatraži novi verifikacioni link',
    backToLogin: 'Nazad na prijavu',
    verificationFailed: 'Verifikacija neuspešna',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dm-order-language');
    return saved || 'sr';
  });

  useEffect(() => {
    localStorage.setItem('dm-order-language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sr' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
