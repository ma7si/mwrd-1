import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  company_name: string | null;
  role: 'client' | 'supplier' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  random_name: string | null;
  created_at: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, email, company_name, role, status, random_name, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(userId: string, status: 'approved' | 'rejected') {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
      alert(`User ${status} successfully`);
      loadUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + err.message);
    } finally {
      setUpdating(null);
    }
  }

  function getRoleBadge(role: User['role']) {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">Admin</Badge>;
      case 'client':
        return <Badge variant="info">Client</Badge>;
      case 'supplier':
        return <Badge variant="warning">Supplier</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  }

  function getStatusBadge(status: User['status']) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status === 'approved');
  const rejectedUsers = users.filter((u) => u.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Review and approve user registrations</p>
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
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{rejectedUsers.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{user.email}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.company_name && <span>Company: {user.company_name} • </span>}
                      <span>Registered: {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'approved')}
                      disabled={updating === user.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                      disabled={updating === user.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* All Users Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Registered
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {user.random_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.company_name || '-'}
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {user.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            disabled={updating === user.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            disabled={updating === user.id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
