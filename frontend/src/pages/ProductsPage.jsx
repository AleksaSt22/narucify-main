import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Loader2, ImageIcon, Link as LinkIcon, Copy, Search, Store, Check } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PUBLIC_URL = window.location.origin;

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  });
  const [togglingShop, setTogglingShop] = useState(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image_url: product.image_url
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      image_url: formData.image_url
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, data);
        toast.success(t('productUpdated'));
      } else {
        await axios.post(`${API_URL}/products`, data);
        toast.success(t('productAdded'));
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('confirm') + '?')) return;
    
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      toast.success(t('productDeleted'));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('error'));
    }
  };

  const handleQuickOrder = async (product) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, {
        items: [{ product_id: product.id, quantity: 1 }],
        notes: ''
      });
      
      const link = `${PUBLIC_URL}/order/${response.data.link_token}`;
      setGeneratedLink(link);
      setLinkDialogOpen(true);
      toast.success(t('orderCreated'));
    } catch (error) {
      console.error('Error creating quick order:', error);
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const toggleShopVisibility = async (product) => {
    setTogglingShop(product.id);
    try {
      const response = await axios.put(`${API_URL}/products/${product.id}/shop`);
      const isNowInShop = response.data.show_in_shop;
      toast.success(isNowInShop ? t('addToStorefront') : t('removeFromStorefront'));
      fetchProducts();
    } catch (error) {
      console.error('Error toggling shop visibility:', error);
      toast.error(error.response?.data?.detail || t('maxStorefrontProducts'));
    } finally {
      setTogglingShop(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS').format(amount) + ' ' + t('currency');
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="products-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">{t('products')}</h1>
            <p className="text-muted-foreground mt-1">{products.length} {t('items')}</p>
          </div>
          <Button 
            onClick={() => openDialog()} 
            className="primary-gradient hover:opacity-90 gap-2"
            data-testid="add-product-btn"
          >
            <Plus className="w-4 h-4" />
            {t('addProduct')}
          </Button>
        </div>

        {/* Search */}
        {products.length > 0 && (
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search') + '...'}
              className="pl-10 max-w-md"
              data-testid="product-search-input"
            />
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">{t('noProducts')}</p>
              <p className="text-muted-foreground mb-6">{t('addFirstProduct')}</p>
              <Button 
                onClick={() => openDialog()} 
                className="primary-gradient hover:opacity-90 gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('addProduct')}
              </Button>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">{t('noProducts')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className={`card-hover animate-fade-in overflow-hidden`}
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square bg-background relative overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge className="absolute top-2 right-2 bg-status-warning/90 border-0">
                      {t('lowStock')}
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge className="absolute top-2 right-2 bg-status-error/90 border-0">
                      Out of stock
                    </Badge>
                  )}
                  {product.show_in_shop && product.stock > 0 && (
                    <Badge className="absolute top-2 left-2 bg-green-500/90 border-0 gap-1">
                      <Store className="w-3 h-3" />
                      {t('inStorefront')}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                    {product.description || '-'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-muted-foreground">{t('stock')}: {product.stock}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(product)}
                        className="h-8 w-8"
                        title={t('editProduct')}
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(product.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title={t('delete')}
                        data-testid={`delete-product-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Order Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 gap-2 hover:border-primary/50"
                    onClick={() => handleQuickOrder(product)}
                    disabled={product.stock === 0}
                    data-testid={`quick-order-${product.id}`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    {t('quickOrder')}
                  </Button>
                  
                  {/* Add to Storefront Button */}
                  <Button 
                    variant={product.show_in_shop ? "default" : "outline"}
                    className={`w-full mt-2 gap-2 ${product.show_in_shop ? 'bg-green-600 hover:bg-green-700' : 'hover:border-green-500/50 hover:text-green-400'}`}
                    onClick={() => toggleShopVisibility(product)}
                    disabled={product.stock === 0 || togglingShop === product.id}
                    data-testid={`toggle-shop-${product.id}`}
                  >
                    {togglingShop === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : product.show_in_shop ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                    {product.show_in_shop ? t('inStorefront') : t('addToStorefront')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingProduct ? t('editProduct') : t('addProduct')}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? t('editProduct') : t('addProduct')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('productName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                  required
                  data-testid="product-name-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                  data-testid="product-description-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('price')} ({t('currency')})</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">{t('stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    data-testid="product-stock-input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">{t('imageUrl')}</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="product-image-input"
                />
              </div>

              {formData.image_url && (
                <div className="rounded-lg overflow-hidden bg-background border border-border">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 primary-gradient hover:opacity-90"
                  disabled={saving}
                  data-testid="save-product-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Quick Order Link Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                {t('quickOrder')}
              </DialogTitle>
              <DialogDescription>{t('quickOrderDesc')}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={generatedLink} 
                  readOnly 
                  className="font-mono text-sm"
                  data-testid="quick-order-link-input"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    toast.success(t('linkCopied'));
                  }}
                  className="primary-gradient hover:opacity-90"
                  data-testid="copy-quick-order-link-btn"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('copyLink')} → DM
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
