import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function ClientDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeRfqs: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [recentRfqs, setRecentRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    const [rfqsData, ordersData] = await Promise.all([
      supabase
        .from('rfqs')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('orders')
        .select('*')
        .eq('client_id', profile.id),
    ]);

    if (rfqsData.data) {
      setRecentRfqs(rfqsData.data);
      setStats((prev) => ({
        ...prev,
        activeRfqs: rfqsData.data.filter((r) => r.status === 'pending' || r.status === 'quoted').length,
      }));
    }

    if (ordersData.data) {
      setStats((prev) => ({
        ...prev,
        activeOrders: ordersData.data.filter(
          (o) => o.status !== 'completed' && o.status !== 'cancelled'
        ).length,
        completedOrders: ordersData.data.filter((o) => o.status === 'completed').length,
      }));
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      pending: 'warning',
      quoted: 'info',
      accepted: 'success',
      expired: 'default',
      cancelled: 'default',
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active RFQs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeRfqs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Quotes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingQuotes}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <Button size="sm" onClick={() => navigate('/portal/client/rfqs')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {recentRfqs.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No RFQs yet</p>
                  <Button onClick={() => navigate('/portal/client/catalog')}>
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentRfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/portal/client/rfqs/${rfq.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{rfq.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {rfq.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created {new Date(rfq.created_at).toLocaleDateString()}
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
                  onClick={() => navigate('/portal/client/catalog')}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Browse Catalog
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/portal/client/rfqs')}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  My RFQs
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/portal/client/orders')}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Order History
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardBody>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our team is here to assist you with any questions
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
