# Narucify - PRD

## Original Problem Statement
Univerzalni web sistem za ljude koji prodaju proizvode direktno preko DM poruka (Instagram, WhatsApp, TikTok), a nemaju klasičnu online prodavnicu.

## User Personas
1. **Super Admin** - Vlasnik platforme, upravlja korisnicima i pristupom
2. **DM Prodavac** - Instagram/WhatsApp prodavci bez registrovane firme
3. **Kupac** - Krajnji korisnik koji prima link i prati porudžbinu

## Implemented Features (Feb 2025)

### Core Features
- [x] JWT autentifikacija (registracija/prijava)
- [x] CRUD proizvoda sa stanjem na lageru
- [x] Kreiranje porudžbine sa više proizvoda
- [x] Quick Order - brzo generisanje linka za jedan proizvod
- [x] Javna stranica za kupca (pregled + potvrda)
- [x] **Order Tracking** - kupac dobija link za praćenje statusa
- [x] Auto update stanja lagera nakon potvrde
- [x] Dashboard sa statistikama
- [x] Search/filter za proizvode i porudžbine
- [x] Dvojezični interfejs (SR/EN)

### Admin Panel (/admin)
- [x] Super Admin login
- [x] Platform statistics
- [x] User management
- [x] Feature access control per user

### Premium Pricing System
- [x] **PRO Plan** - 13.99€/mesečno
- [x] **Analitika** - 5.99€/mesečno
- [x] **Finansije** - 7.99€/mesečno
- [x] **Pregled Stanja** - 2.99€/mesečno
- [x] **Upravljanje Kupcima** - 5.99€/mesečno
- [x] **Marketing** - 9.99€/mesečno
- [x] **Custom Branding** - 4.99€/mesečno
- [x] **Priority Support** - 3.99€/mesečno
- [x] Premium kartice sa animiranim zvezdicama
- [x] Detaljni modali sa Problem/Rešenje/Šta dobijaš/Pro saveti

### Mini Shop (Feb 2025) ✅ COMPLETED
- [x] Javna prodavnica za svakog prodavca (/shop/:userId)
- [x] Do 10 proizvoda besplatno
- [x] Toggle dugme "Dodaj u prodavnicu" na stranici proizvoda
- [x] Sekcija u Podešavanjima za upravljanje proizvodima
- [x] **NOVO: Kompletna checkout forma sa korpicom**
- [x] **NOVO: Kreiranje porudžbine direktno iz Mini Shop-a**
- [x] Watermark "Powered by Narucify" za ne-PRO korisnike

### Editable Delivery Time (Feb 2025) ✅ COMPLETED
- [x] Podrazumevano vreme dostave u podešavanjima
- [x] Prikaz vremena dostave na svakoj porudžbini
- [x] Dugme sa satom za ažuriranje vremena dostave
- [x] Dialog za unos broja dana
- [x] **Auto-save na blur** - vreme dostave se čuva automatski

### Gamification - Badges (Feb 2025) ✅ COMPLETED
- [x] 4 nivoa bedževa
- [x] Profesionalni dizajn bedževa sa ikonama
- [x] Prikaz osvojenih bedževa u Profilu
- [x] Napredak ka sledećem bedžu
- [x] Full-screen animacija čestitke sa confetti efektom
- [x] "Čestitamo od Narucify tima" poruka

### Referral Program (Feb 2025) ✅ COMPLETED
- [x] Svaki korisnik dobija referral kod
- [x] Referral link u podešavanjima
- [x] Oba korisnika dobijaju mesec dana PRO besplatno
- [x] Brojač poziva i uštede

### Backend Production Hardening ✅ COMPLETED
- [x] MongoDB Atlas integracija (cloud database)
- [x] Connection pooling (maxPoolSize=50, retryWrites)
- [x] 17+ database indeksa za optimizovane upite
- [x] Health check endpoint (/api/health)
- [x] MongoDB aggregation pipelines za stats (umesto in-memory)
- [x] Konfigurisani environment variables (.env)
- [x] CORS pravilno parsiran
- [x] Rate limiting konfigurisan preko env
- [x] Logging sa proper levelima

### Analytics Page ✅ COMPLETED
- [x] Period selektor (7d/30d/90d/365d)
- [x] Summary kartice (prihod, porudžbine, prosečna vrednost sa growth pokazateljima)
- [x] Dnevni prihod bar chart
- [x] Top proizvodi ranking
- [x] Top gradovi sa progress barovima
- [x] Distribucija statusa porudžbina
- [x] Backend aggregation pipeline za podatke

### Finances Page ✅ COMPLETED
- [x] Prihod/rashodi/profit/marža summary kartice
- [x] Rashodi po kategorijama sa color-coded barovima
- [x] Mesečni pregled prihoda
- [x] Lista troškova sa dodavanjem/brisanjem
- [x] Add Expense dialog (opis, iznos, kategorija, datum)
- [x] 6 kategorija troškova (shipping, packaging, ads, supplies, tools, other)

### Export System ✅ COMPLETED
- [x] CSV export porudžbina (UTF-8 BOM za Excel)
- [x] CSV export kupaca
- [x] **PDF export porudžbina** sa profesionalnom tabelom (ReportLab)
- [x] Narucify branding u PDF-ovima
- [x] Dugmad za export na stranici porudžbina

### Customers Page Upgrade ✅ COMPLETED
- [x] Pretraga po imenu, telefonu, emailu, gradu
- [x] Sortiranje (ime, broj porudžbina, potrošnja, poslednja porudžbina)
- [x] Summary kartice (ukupno kupaca, povratni kupci, prosečna potrošnja, gradovi)
- [x] Klikabilne kartice sa brojem porudžbina i ukupnom potrošnjom
- [x] Customer detail dialog sa kontakt info, statistikama i istorijom porudžbina
- [x] CSV export kupaca

### Dashboard Improvements ✅ COMPLETED
- [x] Mini bar chart prihoda za poslednjih 7 dana
- [x] Today's orders/revenue summary
- [x] Quick navigation linkovi ka Analitici i Porudžbinama
- [x] Klikabilne nedavne porudžbine

### Rebranding ✅ COMPLETED
- [x] Sve "DMOrder" reference zamenjene sa "Narucify"
- [x] Logo inicijal D → N
- [x] HTML title i meta opis ažurirani
- [x] Admin panel rebranded
- [x] Public pages rebranded
- [x] Backend API opis ažuriran

## Admin Credentials
- URL: /admin
- Email: admin@narucify.com
- Password: admin123

## Tech Stack
- Backend: FastAPI, MongoDB Atlas, Motor (async), JWT, ReportLab
- Frontend: React, Tailwind CSS, Shadcn/UI, Framer Motion, canvas-confetti
- Theme: Dark mode first, Orange (#FF5500) accent
- i18n: Serbian/English via LanguageContext

## Next Tasks (P1)
1. Implementiraj Stripe za PRO pretplate

## Future Tasks (P2)
- Notifikacija za Super Admin kada se novi prodavac registruje
- WhatsApp Business API integracija
- AI predviđanje prodaje
- SMS kampanje
- Push notifikacije
- Image upload za proizvode (umesto URL)
- Pagination za liste
- Account management (promena lozinke/emaila)

## Key API Endpoints
- `/api/auth/register`, `/api/auth/login` (Seller Auth)
- `/api/auth/me` (Get user with badges check)
- `/api/auth/profile` (Update profile/delivery days)
- `/api/auth/badges-seen` (Mark badges as seen)
- `/api/admin/login` (Super Admin Auth)
- `/api/products` (CRUD)
- `/api/products/{id}/shop` (Toggle shop visibility)
- `/api/orders` (CRUD)
- `/api/orders/{id}/status` (Update status + delivery days)
- `/api/public/shop/{userId}` (Public mini shop)
- `/api/public/shop/{userId}/order` (Create order from mini shop)
- `/api/public/order/{linkToken}` (Public order page)
- `/api/track/{trackingId}` (Order tracking)
- `/api/health` (Health check)
- `/api/analytics/overview` (Analytics data)
- `/api/finances/overview` (Financial overview)
- `/api/finances/expenses` (Expense CRUD)
- `/api/export/orders/csv` (CSV export)
- `/api/export/orders/pdf` (PDF export)
- `/api/export/customers/csv` (Customers CSV)
