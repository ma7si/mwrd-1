import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, Plus, AlertCircle } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'quoted' | 'closed' | 'cancelled';
  created_at: string;
  deadline: string | null;
  quote_count?: number;
}

export function ClientRFQs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRFQs();
  }, [user]);

  async function loadRFQs() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch RFQs with quote counts
      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          deadline,
          quotes!quotes_rfq_id_fkey(id)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (rfqError) throw rfqError;

      // Transform data to include quote counts
      const rfqsWithCounts = (rfqData || []).map(rfq => ({
        id: rfq.id,
        title: rfq.title,
        description: rfq.description,
        status: rfq.status,
        created_at: rfq.created_at,
        deadline: rfq.deadline,
        quote_count: Array.isArray(rfq.quotes) ? rfq.quotes.length : 0
      }));

      setRfqs(rfqsWithCounts);
    } catch (err: any) {
      console.error('Error loading RFQs:', err);
      setError(err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  }

  async function cancelRFQ(rfqId: string) {
    if (!confirm('Are you sure you want to cancel this RFQ?')) return;

    try {
      const { error } = await supabase
        .from('rfqs')
        .update({ status: 'cancelled' })
        .eq('id', rfqId);

      if (error) throw error;

      // Refresh the list
      loadRFQs();
    } catch (err: any) {
      console.error('Error cancelling RFQ:', err);
      alert('Failed to cancel RFQ: ' + err.message);
    }
  }

  function getStatusBadge(status: RFQ['status']) {
    switch (status) {
      case 'open':
        return <Badge variant="info">Open</Badge>;
      case 'quoted':
        return <Badge variant="warning">Quoted</Badge>;
      case 'closed':
        return <Badge variant="success">Closed</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading RFQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My RFQs</h1>
          <p className="text-gray-600 mt-1">Manage your requests for quotation</p>
        </div>
        <Button onClick={() => navigate('/portal/client/catalog')}>
          <Plus className="w-4 h-4 mr-2" />
          Create RFQ
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

      {rfqs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQs yet</h3>
            <p className="text-gray-600 mb-6">
              Start by browsing the catalog and creating your first RFQ
            </p>
            <Button onClick={() => navigate('/portal/client/catalog')}>
              Browse Catalog
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {rfq.title}
                      </h3>
                      {getStatusBadge(rfq.status)}
                    </div>
                    {rfq.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {rfq.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Created: {formatDate(rfq.created_at)}</span>
                      {rfq.deadline && (
                        <span>Deadline: {formatDate(rfq.deadline)}</span>
                      )}
                      <span className="font-medium text-indigo-600">
                        {rfq.quote_count} {rfq.quote_count === 1 ? 'Quote' : 'Quotes'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/portal/client/rfqs/${rfq.id}`)}
                  >
                    View Details
                  </Button>
                  {rfq.status === 'open' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelRFQ(rfq.id)}
                    >
                      Cancel RFQ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
