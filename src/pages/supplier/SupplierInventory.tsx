import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Package, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  categories: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export function SupplierInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    base_price: '',
    category_id: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [itemsData, categoriesData] = await Promise.all([
        supabase
          .from('items')
          .select(`
            id,
            name,
            description,
            unit,
            base_price,
            status,
            created_at,
            categories!items_category_id_fkey(id, name)
          `)
          .eq('supplier_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name')
      ]);

      if (itemsData.error) throw itemsData.error;
      if (categoriesData.error) throw categoriesData.error;

      setItems(itemsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      unit: '',
      base_price: '',
      category_id: categories[0]?.id || ''
    });
    setShowModal(true);
  }

  function openEditModal(item: Item) {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      unit: item.unit,
      base_price: item.base_price.toString(),
      category_id: item.categories.id
    });
    setShowModal(true);
  }

  async function saveItem() {
    if (!user) return;

    if (!formData.name.trim() || !formData.unit.trim() || !formData.base_price) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        unit: formData.unit.trim(),
        base_price: parseFloat(formData.base_price),
        category_id: formData.category_id,
        supplier_id: user.id,
        status: 'pending' as const
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('Item updated successfully! Waiting for admin approval.');
      } else {
        // Create new item
        const { error } = await supabase.from('items').insert(itemData);

        if (error) throw error;
        alert('Item added successfully! Waiting for admin approval.');
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('Error saving item:', err);
      alert('Failed to save item: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) throw error;
      alert('Item deleted successfully');
      loadData();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item: ' + err.message);
    }
  }

  function getStatusBadge(status: Item['status']) {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your products and pricing</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {error && (
        <Card>
          <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first product to start receiving RFQs
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="info" size="sm">
                        {item.categories.name}
                      </Badge>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit:</span>
                    <span className="font-medium text-gray-900">{item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.base_price)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            placeholder="e.g., Office Desk"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit"
              type="text"
              placeholder="e.g., piece, kg, box"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
            <Input
              label="Base Price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.base_price}
              onChange={(e) =>
                setFormData({ ...formData, base_price: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              Items require admin approval before they appear in the catalog.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveItem}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
