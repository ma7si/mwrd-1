import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Package, AlertCircle, Eye } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_address: string | null;
  tracking_number: string | null;
  user_profiles: {
    random_name: string;
    rating: number | null;
  };
  rfqs: {
    title: string;
  };
}

export function ClientOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  async function loadOrders() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          delivery_address,
          tracking_number,
          user_profiles!orders_supplier_id_fkey(random_name, rating),
          rfqs!orders_rfq_id_fkey(title)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: Order['status']) {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'shipped':
        return <Badge variant="info">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">Track and manage your orders</p>
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

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating an RFQ and accepting a quote
            </p>
            <Button onClick={() => navigate('/portal/client/catalog')}>
              Browse Catalog
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {order.rfqs.title}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Supplier: {order.user_profiles.random_name}</span>
                      <span>Ordered: {formatDate(order.created_at)}</span>
                      {order.user_profiles.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          {order.user_profiles.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {order.tracking_number && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Tracking: </span>
                        <span className="font-mono font-medium text-indigo-600">
                          {order.tracking_number}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/portal/client/orders/${order.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
