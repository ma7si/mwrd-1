import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText, DollarSign, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function SupplierDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingItems: 0,
    activeRfqs: 0,
    pendingQuotes: 0,
    rating: 0,
  });
  const [recentRfqs, setRecentRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    const [itemsData, rfqsData] = await Promise.all([
      supabase
        .from('items')
        .select('*')
        .eq('supplier_id', profile.id),
      supabase
        .from('rfq_items')
        .select('*, rfqs(*), items!inner(supplier_id)')
        .eq('items.supplier_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (itemsData.data) {
      setStats((prev) => ({
        ...prev,
        totalItems: itemsData.data.length,
        pendingItems: itemsData.data.filter((i) => i.status === 'pending').length,
      }));
    }

    if (rfqsData.data) {
      const uniqueRfqs = Array.from(
        new Map(rfqsData.data.map((item) => [item.rfqs.id, item.rfqs])).values()
      );
      setRecentRfqs(uniqueRfqs.slice(0, 5));
      setStats((prev) => ({
        ...prev,
        activeRfqs: uniqueRfqs.filter((r: any) => r.status === 'pending').length,
      }));
    }

    setStats((prev) => ({
      ...prev,
      rating: profile.rating || 0,
    }));

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      pending: 'warning',
      quoted: 'info',
      accepted: 'success',
      expired: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your inventory and respond to RFQs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingItems}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active RFQs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeRfqs}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Your Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent RFQs</h2>
                <Button size="sm" onClick={() => navigate('/portal/supplier/rfqs')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {recentRfqs.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No RFQs available</p>
                  <p className="text-sm text-gray-400">
                    RFQs matching your inventory will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentRfqs.map((rfq: any) => (
                    <div
                      key={rfq.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/portal/supplier/rfqs/${rfq.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{rfq.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {rfq.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Received {new Date(rfq.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">{getStatusBadge(rfq.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => navigate('/portal/supplier/items/new')}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Add New Item
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/portal/supplier/items')}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Manage Inventory
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/portal/supplier/rfqs')}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Browse RFQs
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardBody>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Build Your Rating</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete orders successfully to improve your supplier rating
                </p>
                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= stats.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
