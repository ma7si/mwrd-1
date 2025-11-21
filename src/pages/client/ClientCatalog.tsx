import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Package, ShoppingCart, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export function ClientCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rfqData, setRfqData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [itemsData, categoriesData] = await Promise.all([
      supabase
        .from('items')
        .select('*, categories(*), user_profiles!supplier_id(random_name, rating)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (itemsData.data) setItems(itemsData.data);
    if (categoriesData.data) setCategories(categoriesData.data);
    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCart = (itemId: string) => {
    const newCart = new Set(cart);
    if (newCart.has(itemId)) {
      newCart.delete(itemId);
      // Remove quantity when item is removed
      const newQuantities = { ...quantities };
      delete newQuantities[itemId];
      setQuantities(newQuantities);
    } else {
      newCart.add(itemId);
      // Set default quantity to 1
      setQuantities({ ...quantities, [itemId]: 1 });
    }
    setCart(newCart);
  };

  async function submitRFQ() {
    if (!user) return;
    if (!rfqData.title.trim()) {
      alert('Please enter an RFQ title');
      return;
    }
    if (cart.size === 0) {
      alert('Please add at least one item to the RFQ');
      return;
    }

    // Validate quantities
    for (const itemId of Array.from(cart)) {
      if (!quantities[itemId] || quantities[itemId] <= 0) {
        alert('Please enter valid quantities for all items');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Create RFQ
      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          client_id: user.id,
          title: rfqData.title,
          description: rfqData.description || null,
          deadline: rfqData.deadline || null,
          status: 'open'
        })
        .select()
        .single();

      if (rfqError) throw rfqError;

      // Create RFQ items
      const rfqItems = Array.from(cart).map(itemId => ({
        rfq_id: rfq.id,
        item_id: itemId,
        quantity: quantities[itemId]
      }));

      const { error: itemsError } = await supabase
        .from('rfq_items')
        .insert(rfqItems);

      if (itemsError) throw itemsError;

      // Reset state
      setCart(new Set());
      setQuantities({});
      setRfqData({ title: '', description: '', deadline: '' });
      setShowRFQModal(false);

      // Navigate to RFQ detail
      navigate(`/portal/client/rfqs/${rfq.id}`);
    } catch (err: any) {
      console.error('Error creating RFQ:', err);
      alert('Failed to create RFQ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">Browse approved items from verified suppliers</p>
        </div>
        {cart.size > 0 && (
          <Button className="relative" onClick={() => setShowRFQModal(true)}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Create RFQ ({cart.size})
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cart.size}
            </span>
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Categories ({items.length})
                </button>
                {categories.map((category) => {
                  const count = items.filter((i) => i.category_id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No products found</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} hover className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <CardBody>
                    <div className="mb-3">
                      <Badge variant="info" size="sm">
                        {item.categories?.name}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Unit: {item.unit}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {item.user_profiles?.rating?.toFixed(1) || 'New'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={cart.has(item.id) ? 'secondary' : 'primary'}
                      className="w-full"
                      onClick={() => toggleCart(item.id)}
                    >
                      {cart.has(item.id) ? (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Remove from RFQ
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to RFQ
                        </>
                      )}
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RFQ Creation Modal */}
      <Modal
        isOpen={showRFQModal}
        onClose={() => !submitting && setShowRFQModal(false)}
        title="Create Request for Quotation"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <Input
              label="RFQ Title"
              type="text"
              placeholder="e.g., Office Supplies Q1 2024"
              value={rfqData.title}
              onChange={(e) => setRfqData({ ...rfqData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Any special requirements or notes..."
              value={rfqData.description}
              onChange={(e) => setRfqData({ ...rfqData, description: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Deadline (Optional)"
              type="date"
              value={rfqData.deadline}
              onChange={(e) => setRfqData({ ...rfqData, deadline: e.target.value })}
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Items & Quantities</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Array.from(cart).map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <div
                    key={itemId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleCart(itemId)}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Unit: {item.unit}</p>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={quantities[itemId] || ''}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [itemId]: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowRFQModal(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitRFQ}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Create RFQ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
