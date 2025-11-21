import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Package, AlertCircle, Eye, Truck } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_address: string | null;
  tracking_number: string | null;
  user_profiles: {
    random_name: string;
  };
  rfqs: {
    title: string;
  };
}

export function SupplierOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

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
          user_profiles!orders_client_id_fkey(random_name),
          rfqs!orders_rfq_id_fkey(title)
        `)
        .eq('supplier_id', user.id)
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

  async function updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
      alert(`Order ${status} successfully`);
    } catch (err: any) {
      console.error('Error updating order:', err);
      alert('Failed to update order: ' + err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function shipOrder() {
    if (!selectedOrder || !trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      setShowShipModal(false);
      setTrackingNumber('');
      setSelectedOrder(null);
      loadOrders();
      alert('Order marked as shipped!');
    } catch (err: any) {
      console.error('Error shipping order:', err);
      alert('Failed to ship order: ' + err.message);
    } finally {
      setUpdating(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Orders to Fulfill</h1>
        <p className="text-gray-600 mt-1">Manage and fulfill your orders</p>
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
            <p className="text-gray-600">
              Orders will appear here when clients accept your quotes
            </p>
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
                      <span>Client: {order.user_profiles.random_name}</span>
                      <span>Ordered: {formatDate(order.created_at)}</span>
                    </div>
                    {order.tracking_number && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Tracking: </span>
                        <span className="font-mono font-medium text-indigo-600">
                          {order.tracking_number}
                        </span>
                      </div>
                    )}
                    {order.delivery_address && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Delivery: </span>
                        <span className="text-gray-700">{order.delivery_address}</span>
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
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/portal/supplier/orders/${order.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={updating}
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowShipModal(true);
                      }}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={updating}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ship Order Modal */}
      <Modal
        isOpen={showShipModal}
        onClose={() => !updating && setShowShipModal(false)}
        title="Ship Order"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              Mark this order as shipped and provide a tracking number for the client.
            </p>
          </div>

          <Input
            label="Tracking Number"
            type="text"
            placeholder="e.g., 1Z999AA10123456784"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowShipModal(false)}
              disabled={updating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={shipOrder}
              disabled={updating || !trackingNumber.trim()}
              className="flex-1"
            >
              {updating ? 'Processing...' : 'Confirm Shipment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
