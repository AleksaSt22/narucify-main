import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut, 
  Menu, 
  X,
  Globe,
  BarChart3,
  Wallet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/products', icon: Package, labelKey: 'products' },
  { path: '/orders', icon: ShoppingCart, labelKey: 'orders' },
  { path: '/analytics', icon: BarChart3, labelKey: 'analytics' },
  { path: '/finances', icon: Wallet, labelKey: 'finances' },
  { path: '/customers', icon: Users, labelKey: 'customers' },
  { path: '/settings', icon: Settings, labelKey: 'settings' },
];

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-border/50 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
            <span className="text-white font-bold font-heading">N</span>
          </div>
          <span className="font-bold font-heading text-foreground">Narucify</span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="language-toggle-mobile">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} data-testid="lang-en">
                {t('english')} {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('sr')} data-testid="lang-sr">
                {t('serbian')} {language === 'sr' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="mobile-menu-btn"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border/50 z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 px-6 flex items-center gap-2 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
            <span className="text-white font-bold font-heading">N</span>
          </div>
          <span className="font-bold font-heading text-foreground">Narucify</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
                data-testid={`nav-${item.labelKey}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.business_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.business_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-between px-2 mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="language-toggle-desktop">
                  <Globe className="w-4 h-4" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  {t('english')} {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('sr')}>
                  {t('serbian')} {language === 'sr' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
