import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  categories: {
    name: string;
  };
  user_profiles: {
    random_name: string | null;
    email: string;
  };
}

export function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: itemsError } = await supabase
        .from('items')
        .select(`
          id,
          name,
          description,
          unit,
          base_price,
          status,
          created_at,
          categories!items_category_id_fkey(name),
          user_profiles!items_supplier_id_fkey(random_name, email)
        `)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  async function updateItemStatus(itemId: string, status: 'approved' | 'rejected') {
    setUpdating(itemId);
    try {
      const { error } = await supabase
        .from('items')
        .update({ status })
        .eq('id', itemId);

      if (error) throw error;
      alert(`Item ${status} successfully`);
      loadItems();
    } catch (err: any) {
      console.error('Error updating item:', err);
      alert('Failed to update item: ' + err.message);
    } finally {
      setUpdating(null);
    }
  }

  function getStatusBadge(status: Item['status']) {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="text-lg text-gray-600">Loading items...</div>
      </div>
    );
  }

  const pendingItems = items.filter((i) => i.status === 'pending');
  const approvedItems = items.filter((i) => i.status === 'approved');
  const rejectedItems = items.filter((i) => i.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
        <p className="text-gray-600 mt-1">Review and approve supplier products</p>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingItems.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedItems.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedItems.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingItems.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Pending Approvals ({pendingItems.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <Card key={item.id} className="bg-yellow-50 border-yellow-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="info" size="sm">
                            {item.categories.name}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-1 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Supplier:</span>
                        <span className="font-medium text-gray-900">
                          {item.user_profiles.random_name || item.user_profiles.email}
                        </span>
                      </div>
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

                    <div className="flex gap-2 pt-3 border-t border-yellow-300">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateItemStatus(item.id, 'approved')}
                        disabled={updating === item.id}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateItemStatus(item.id, 'rejected')}
                        disabled={updating === item.id}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* All Items */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Items</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
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

                  <div className="space-y-1 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Supplier:</span>
                      <span className="font-medium text-gray-900">
                        {item.user_profiles.random_name || item.user_profiles.email}
                      </span>
                    </div>
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Added:</span>
                      <span className="text-gray-600 text-xs">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateItemStatus(item.id, 'approved')}
                        disabled={updating === item.id}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateItemStatus(item.id, 'rejected')}
                        disabled={updating === item.id}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
