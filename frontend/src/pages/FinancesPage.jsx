import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  Trash2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const periods = [
  { value: '7d', labelEn: '7 Days', labelSr: '7 dana' },
  { value: '30d', labelEn: '30 Days', labelSr: '30 dana' },
  { value: '90d', labelEn: '90 Days', labelSr: '90 dana' },
  { value: '365d', labelEn: '1 Year', labelSr: '1 godina' },
];

const expenseCategories = [
  { value: 'shipping', labelEn: 'Shipping', labelSr: 'Dostava' },
  { value: 'packaging', labelEn: 'Packaging', labelSr: 'Pakovanje' },
  { value: 'ads', labelEn: 'Advertising', labelSr: 'Reklame' },
  { value: 'supplies', labelEn: 'Supplies', labelSr: 'Materijal' },
  { value: 'tools', labelEn: 'Tools & Software', labelSr: 'Alati i softver' },
  { value: 'other', labelEn: 'Other', labelSr: 'Ostalo' },
];

export default function FinancesPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New expense form
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, expensesRes] = await Promise.all([
        axios.get(`${API_URL}/finances/overview?period=${period}`),
        axios.get(`${API_URL}/finances/expenses?period=${period}`)
      ]);
      setOverview(overviewRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error fetching finances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error(language === 'sr' ? 'Popuni sva polja' : 'Fill all fields');
      return;
    }
    
    try {
      setSaving(true);
      await axios.post(`${API_URL}/finances/expenses`, {
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      toast.success(language === 'sr' ? 'Trošak dodat' : 'Expense added');
      setNewExpense({ description: '', amount: '', category: 'other', date: new Date().toISOString().slice(0, 10) });
      setAddExpenseOpen(false);
      fetchData();
    } catch (error) {
      toast.error(language === 'sr' ? 'Greška pri dodavanju' : 'Error adding expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/finances/expenses/${id}`);
      toast.success(language === 'sr' ? 'Trošak obrisan' : 'Expense deleted');
      fetchData();
    } catch (error) {
      toast.error(language === 'sr' ? 'Greška pri brisanju' : 'Error deleting');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(Math.round(amount)) + ' RSD';
  };

  const getCategoryLabel = (cat) => {
    const found = expenseCategories.find(c => c.value === cat);
    return found ? (language === 'sr' ? found.labelSr : found.labelEn) : cat;
  };

  if (loading && !overview) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const profitColor = (overview?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400';
  const profitBg = (overview?.profit || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <Layout>
      <div className="space-y-6" data-testid="finances-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-2">
              <Wallet className="w-8 h-8 text-primary" />
              {language === 'sr' ? 'Finansije' : 'Finances'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'sr' ? 'Prihodi, rashodi i profit' : 'Revenue, expenses and profit'}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
                className={period === p.value ? 'bg-primary text-white' : 'border-zinc-700 text-zinc-400'}
              >
                {language === 'sr' ? p.labelSr : p.labelEn}
              </Button>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Prihod' : 'Revenue'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-green-400 mt-1">
                    {formatCurrency(overview?.revenue || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overview?.completed_orders || 0} {language === 'sr' ? 'završenih' : 'completed'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Rashodi' : 'Expenses'}
                  </p>
                  <p className="text-2xl font-bold font-heading text-red-400 mt-1">
                    {formatCurrency(overview?.expenses || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit */}
          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Profit' : 'Profit'}
                  </p>
                  <p className={`text-2xl font-bold font-heading ${profitColor} mt-1`}>
                    {formatCurrency(overview?.profit || 0)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${profitBg} flex items-center justify-center`}>
                  <PiggyBank className={`w-6 h-6 ${profitColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Margin */}
          <Card className="card-hover animate-fade-in bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sr' ? 'Marža' : 'Margin'}
                  </p>
                  <p className={`text-2xl font-bold font-heading ${profitColor} mt-1`}>
                    {overview?.margin || 0}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${profitBg} flex items-center justify-center`}>
                  {(overview?.margin || 0) >= 0 
                    ? <TrendingUp className={`w-6 h-6 ${profitColor}`} />
                    : <TrendingDown className={`w-6 h-6 ${profitColor}`} />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <Card className="animate-fade-in bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                {language === 'sr' ? 'Rashodi po kategoriji' : 'Expenses by Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.expenses_by_category?.length > 0 ? (
                <div className="space-y-3">
                  {overview.expenses_by_category.map((cat, i) => {
                    const maxAmount = overview.expenses_by_category[0]?.total || 1;
                    const categoryColors = {
                      shipping: 'bg-blue-500',
                      packaging: 'bg-purple-500',
                      ads: 'bg-orange-500',
                      supplies: 'bg-cyan-500',
                      tools: 'bg-pink-500',
                      other: 'bg-zinc-500'
                    };
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{getCategoryLabel(cat.category)}</span>
                          <span className="text-sm font-medium text-foreground">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${categoryColors[cat.category] || 'bg-zinc-500'}`}
                            style={{ width: `${(cat.total / maxAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">
                  {language === 'sr' ? 'Nema troškova' : 'No expenses yet'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="animate-fade-in bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {language === 'sr' ? 'Mesečni prihod' : 'Monthly Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.monthly?.length > 0 ? (
                <div className="space-y-3">
                  {overview.monthly.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.month}</p>
                        <p className="text-xs text-muted-foreground">{m.orders} {language === 'sr' ? 'porudžbina' : 'orders'}</p>
                      </div>
                      <p className="text-sm font-bold text-green-400">{formatCurrency(m.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">
                  {language === 'sr' ? 'Nema podataka' : 'No data yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <Card className="animate-fade-in bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-foreground">
              {language === 'sr' ? 'Troškovi' : 'Expenses'}
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setAddExpenseOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              {language === 'sr' ? 'Dodaj trošak' : 'Add Expense'}
            </Button>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{exp.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{getCategoryLabel(exp.category)}</span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-muted-foreground">{exp.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-red-400">-{formatCurrency(exp.amount)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">
                  {language === 'sr' ? 'Nema troškova. Dodaj prvi trošak.' : 'No expenses. Add your first expense.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Expense Dialog */}
        <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {language === 'sr' ? 'Dodaj trošak' : 'Add Expense'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">{language === 'sr' ? 'Opis' : 'Description'}</Label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder={language === 'sr' ? 'Npr. Poštarina za 10 paketa' : 'E.g. Shipping for 10 packages'}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">{language === 'sr' ? 'Iznos (RSD)' : 'Amount (RSD)'}</Label>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">{language === 'sr' ? 'Kategorija' : 'Category'}</Label>
                <Select value={newExpense.category} onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === 'sr' ? cat.labelSr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">{language === 'sr' ? 'Datum' : 'Date'}</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
              <Button 
                onClick={handleAddExpense} 
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'sr' ? 'Dodaj' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
