import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Package, DollarSign, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RFQDetail {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'quoted' | 'closed' | 'cancelled';
  created_at: string;
  deadline: string | null;
  rfq_items: Array<{
    id: string;
    quantity: number;
    items: {
      id: string;
      name: string;
      unit: string;
      description: string | null;
      categories: {
        name: string;
      };
    };
  }>;
  quotes: Array<{
    id: string;
    supplier_id: string;
    total_price: number;
    notes: string | null;
    created_at: string;
    status: 'pending' | 'accepted' | 'rejected';
    user_profiles: {
      random_name: string;
      rating: number | null;
    };
    quote_items: Array<{
      rfq_item_id: string;
      unit_price: number;
    }>;
  }>;
}

export function ClientRFQDetail() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadRFQ();
  }, [rfqId]);

  async function loadRFQ() {
    if (!rfqId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          *,
          rfq_items!rfq_items_rfq_id_fkey(
            id,
            quantity,
            items!rfq_items_item_id_fkey(
              id,
              name,
              unit,
              description,
              categories!items_category_id_fkey(name)
            )
          ),
          quotes!quotes_rfq_id_fkey(
            id,
            supplier_id,
            total_price,
            notes,
            created_at,
            status,
            user_profiles!quotes_supplier_id_fkey(random_name, rating),
            quote_items!quote_items_quote_id_fkey(rfq_item_id, unit_price)
          )
        `)
        .eq('id', rfqId)
        .single();

      if (rfqError) throw rfqError;
      setRfq(data);
    } catch (err: any) {
      console.error('Error loading RFQ:', err);
      setError(err.message || 'Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  }

  async function acceptQuote(quoteId: string) {
    if (!rfq) return;

    setAccepting(true);
    try {
      // Update quote status to accepted
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Reject all other quotes
      const otherQuotes = rfq.quotes.filter((q) => q.id !== quoteId).map((q) => q.id);
      if (otherQuotes.length > 0) {
        const { error: rejectError } = await supabase
          .from('quotes')
          .update({ status: 'rejected' })
          .in('id', otherQuotes);

        if (rejectError) throw rejectError;
      }

      // Update RFQ status to closed
      const { error: rfqError } = await supabase
        .from('rfqs')
        .update({ status: 'closed' })
        .eq('id', rfq.id);

      if (rfqError) throw rfqError;

      // Find the accepted quote
      const acceptedQuote = rfq.quotes.find((q) => q.id === quoteId);
      if (!acceptedQuote) throw new Error('Accepted quote not found');

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          rfq_id: rfq.id,
          quote_id: quoteId,
          client_id: user!.id,
          supplier_id: acceptedQuote.supplier_id,
          total_amount: acceptedQuote.total_price,
          status: 'pending'
        });

      if (orderError) throw orderError;

      setShowAcceptModal(false);
      alert('Quote accepted! Order created successfully.');
      navigate('/portal/client/orders');
    } catch (err: any) {
      console.error('Error accepting quote:', err);
      alert('Failed to accept quote: ' + err.message);
    } finally {
      setAccepting(false);
    }
  }

  function getStatusBadge(status: RFQDetail['status']) {
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

  function getQuoteStatusBadge(status: 'pending' | 'accepted' | 'rejected') {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
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
        <div className="text-lg text-gray-600">Loading RFQ details...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/portal/client/rfqs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to RFQs
        </Button>
        <Card>
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading RFQ</h3>
            <p className="text-gray-600">{error || 'RFQ not found'}</p>
          </div>
        </Card>
      </div>
    );
  }

  const selectedQuoteData = rfq.quotes.find((q) => q.id === selectedQuote);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/portal/client/rfqs')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to RFQs
      </Button>

      {/* RFQ Overview */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
                {getStatusBadge(rfq.status)}
              </div>
              {rfq.description && (
                <p className="text-gray-600 mt-2">{rfq.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{formatDate(rfq.created_at)}</p>
              </div>
            </div>
            {rfq.deadline && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium text-gray-900">{formatDate(rfq.deadline)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium text-gray-900">{rfq.rfq_items.length}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Requested Items */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requested Items</h2>
          <div className="space-y-3">
            {rfq.rfq_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{item.items.name}</h3>
                    <Badge variant="info" size="sm">
                      {item.items.categories.name}
                    </Badge>
                  </div>
                  {item.items.description && (
                    <p className="text-sm text-gray-600">{item.items.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {item.quantity} {item.items.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quotes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quotes Received ({rfq.quotes.length})
          </h2>

          {rfq.quotes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-600">Suppliers will submit their quotes soon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rfq.quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {quote.user_profiles.random_name}
                        </h3>
                        {getQuoteStatusBadge(quote.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Submitted: {formatDate(quote.created_at)}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          {quote.user_profiles.rating?.toFixed(1) || 'New'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(quote.total_price)}
                      </p>
                    </div>
                  </div>

                  {quote.notes && (
                    <p className="text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded">
                      {quote.notes}
                    </p>
                  )}

                  {rfq.status !== 'closed' && rfq.status !== 'cancelled' && quote.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedQuote(quote.id);
                          setShowAcceptModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Quote
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Accept Quote Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => !accepting && setShowAcceptModal(false)}
        title="Accept Quote"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              By accepting this quote, you will create an order with{' '}
              <strong>{selectedQuoteData?.user_profiles.random_name}</strong> for{' '}
              <strong>{formatCurrency(selectedQuoteData?.total_price || 0)}</strong>.
            </p>
            <p className="text-sm text-blue-900 mt-2">
              All other quotes will be automatically rejected.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAcceptModal(false)}
              disabled={accepting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedQuote && acceptQuote(selectedQuote)}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? 'Processing...' : 'Confirm & Accept'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
