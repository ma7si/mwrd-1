import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingUsers: 0,
    totalClients: 0,
    totalSuppliers: 0,
    pendingItems: 0,
    activeRfqs: 0,
    totalOrders: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [usersData, itemsData, rfqsData, ordersData] = await Promise.all([
      supabase.from('user_profiles').select('*'),
      supabase.from('items').select('*'),
      supabase.from('rfqs').select('*'),
      supabase.from('orders').select('*'),
    ]);

    if (usersData.data) {
      const pending = usersData.data.filter((u) => u.status === 'pending');
      setPendingApprovals(pending.slice(0, 5));
      setStats((prev) => ({
        ...prev,
        pendingUsers: pending.length,
        totalClients: usersData.data.filter((u) => u.role === 'client' && u.status === 'approved').length,
        totalSuppliers: usersData.data.filter((u) => u.role === 'supplier' && u.status === 'approved').length,
      }));
    }

    if (itemsData.data) {
      setStats((prev) => ({
        ...prev,
        pendingItems: itemsData.data.filter((i) => i.status === 'pending').length,
      }));
    }

    if (rfqsData.data) {
      setStats((prev) => ({
        ...prev,
        activeRfqs: rfqsData.data.filter((r) => r.status === 'pending' || r.status === 'quoted').length,
      }));
    }

    if (ordersData.data) {
      setStats((prev) => ({
        ...prev,
        totalOrders: ordersData.data.length,
      }));
    }

    setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage the mwrd marketplace platform</p>
      </div>

      {stats.pendingUsers > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardBody>
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {stats.pendingUsers} user{stats.pendingUsers !== 1 ? 's' : ''} pending approval
                </p>
                <p className="text-sm text-yellow-700">Review and approve new registrations</p>
              </div>
              <Button size="sm" onClick={() => navigate('/portal/admin/users')}>
                Review Now
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSuppliers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingItems}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active RFQs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeRfqs}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Pending User Approvals</h2>
              <Button size="sm" onClick={() => navigate('/portal/admin/users')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingApprovals.map((user) => (
                  <div
                    key={user.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/portal/admin/users/${user.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{user.real_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        {user.company_name && (
                          <p className="text-sm text-gray-500">{user.company_name}</p>
                        )}
                      </div>
                      <Badge variant="warning" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => navigate('/portal/admin/users')}
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate('/portal/admin/items')}
              >
                <Package className="w-5 h-5 mr-3" />
                Review Items
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate('/portal/admin/rfqs')}
              >
                <FileText className="w-5 h-5 mr-3" />
                Monitor RFQs
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => navigate('/portal/admin/margins')}
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Configure Margins
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
