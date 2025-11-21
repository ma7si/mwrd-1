import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { FileText, Send, Calendar, Package, AlertCircle } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  user_profiles: {
    random_name: string;
  };
  rfq_items: Array<{
    id: string;
    quantity: number;
    items: {
      id: string;
      name: string;
      unit: string;
      supplier_id: string;
      categories: {
        name: string;
        margin_rules: Array<{
          margin_percentage: number;
        }>;
      };
    };
  }>;
  quotes: Array<{
    supplier_id: string;
  }>;
}

export function SupplierRFQs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState<{
    notes: string;
    prices: Record<string, number>;
  }>({
    notes: '',
    prices: {}
  });

  useEffect(() => {
    loadRFQs();
  }, [user]);

  async function loadRFQs() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all my item IDs
      const { data: myItems, error: itemsError } = await supabase
        .from('items')
        .select('id')
        .eq('supplier_id', user.id)
        .eq('status', 'approved');

      if (itemsError) throw itemsError;

      const myItemIds = myItems?.map((item) => item.id) || [];

      if (myItemIds.length === 0) {
        setRfqs([]);
        setLoading(false);
        return;
      }

      // Find open RFQs that include my items
      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          id,
          title,
          description,
          created_at,
          deadline,
          user_profiles!rfqs_client_id_fkey(random_name),
          rfq_items!rfq_items_rfq_id_fkey(
            id,
            quantity,
            item_id,
            items!rfq_items_item_id_fkey(
              id,
              name,
              unit,
              supplier_id,
              categories!items_category_id_fkey(
                name,
                margin_rules!margin_rules_category_id_fkey(margin_percentage)
              )
            )
          ),
          quotes!quotes_rfq_id_fkey(supplier_id)
        `)
        .eq('status', 'open')
        .in('rfq_items.item_id', myItemIds)
        .order('created_at', { ascending: false });

      if (rfqError) throw rfqError;

      // Filter to only show RFQs where ALL items are mine and I haven't quoted yet
      const relevantRFQs = (rfqData || []).filter((rfq) => {
        // Check if all items in this RFQ are supplied by me
        const allItemsMine = rfq.rfq_items.every(
          (item) => item.items.supplier_id === user.id
        );
        // Check if I haven't already submitted a quote
        const alreadyQuoted = rfq.quotes.some((q) => q.supplier_id === user.id);
        return allItemsMine && !alreadyQuoted;
      });

      setRfqs(relevantRFQs);
    } catch (err: any) {
      console.error('Error loading RFQs:', err);
      setError(err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  }

  function openQuoteModal(rfq: RFQ) {
    setSelectedRFQ(rfq);
    // Initialize prices with empty values
    const initialPrices: Record<string, number> = {};
    rfq.rfq_items.forEach((item) => {
      initialPrices[item.id] = 0;
    });
    setQuoteData({ notes: '', prices: initialPrices });
    setShowQuoteModal(true);
  }

  async function submitQuote() {
    if (!selectedRFQ || !user) return;

    // Validate prices
    for (const item of selectedRFQ.rfq_items) {
      if (!quoteData.prices[item.id] || quoteData.prices[item.id] <= 0) {
        alert('Please enter valid prices for all items');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Calculate total price
      const totalPrice = selectedRFQ.rfq_items.reduce((sum, item) => {
        return sum + quoteData.prices[item.id] * item.quantity;
      }, 0);

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          rfq_id: selectedRFQ.id,
          supplier_id: user.id,
          total_price: totalPrice,
          notes: quoteData.notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const quoteItems = selectedRFQ.rfq_items.map((item) => ({
        quote_id: quote.id,
        rfq_item_id: item.id,
        unit_price: quoteData.prices[item.id]
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      // Update RFQ status to 'quoted' if not already
      const { error: rfqError } = await supabase
        .from('rfqs')
        .update({ status: 'quoted' })
        .eq('id', selectedRFQ.id)
        .eq('status', 'open');

      if (rfqError) throw rfqError;

      setShowQuoteModal(false);
      setSelectedRFQ(null);
      alert('Quote submitted successfully!');
      loadRFQs();
    } catch (err: any) {
      console.error('Error submitting quote:', err);
      alert('Failed to submit quote: ' + err.message);
    } finally {
      setSubmitting(false);
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

  function calculateEstimatedTotal(): number {
    if (!selectedRFQ) return 0;
    return selectedRFQ.rfq_items.reduce((sum, item) => {
      const price = quoteData.prices[item.id] || 0;
      return sum + price * item.quantity;
    }, 0);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading RFQ opportunities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RFQ Opportunities</h1>
        <p className="text-gray-600 mt-1">Browse and respond to requests for your products</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQs available</h3>
            <p className="text-gray-600 mb-6">
              There are currently no open RFQs for your products. Check back later!
            </p>
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
                      <h3 className="text-xl font-semibold text-gray-900">{rfq.title}</h3>
                      <Badge variant="info">Open</Badge>
                    </div>
                    {rfq.description && (
                      <p className="text-gray-600 text-sm mb-3">{rfq.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>From: {rfq.user_profiles.random_name}</span>
                      <span>Posted: {formatDate(rfq.created_at)}</span>
                      {rfq.deadline && <span>Deadline: {formatDate(rfq.deadline)}</span>}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requested Items:</h4>
                  <div className="space-y-2">
                    {rfq.rfq_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.items.name}</span>
                          <Badge variant="info" size="sm">
                            {item.items.categories.name}
                          </Badge>
                        </div>
                        <span className="text-gray-600">
                          {item.quantity} {item.items.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="primary" size="sm" onClick={() => openQuoteModal(rfq)}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Quote
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Submission Modal */}
      <Modal
        isOpen={showQuoteModal}
        onClose={() => !submitting && setShowQuoteModal(false)}
        title="Submit Quote"
        size="lg"
      >
        {selectedRFQ && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-1">{selectedRFQ.title}</h3>
              <p className="text-sm text-indigo-700">
                Client: {selectedRFQ.user_profiles.random_name}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Item Pricing</h3>
              <div className="space-y-3">
                {selectedRFQ.rfq_items.map((item) => {
                  const unitPrice = quoteData.prices[item.id] || 0;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.items.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} {item.items.unit}
                          </p>
                        </div>
                        <Badge variant="info" size="sm">
                          {item.items.categories.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            label={`Unit Price (per ${item.items.unit})`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={quoteData.prices[item.id] || ''}
                            onChange={(e) =>
                              setQuoteData({
                                ...quoteData,
                                prices: {
                                  ...quoteData.prices,
                                  [item.id]: parseFloat(e.target.value) || 0
                                }
                              })
                            }
                          />
                        </div>
                        <div className="w-32 text-right">
                          <p className="text-sm text-gray-500 mb-1">Line Total</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes to Client (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Delivery terms, special conditions, etc..."
                value={quoteData.notes}
                onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Estimated Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(calculateEstimatedTotal())}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowQuoteModal(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitQuote}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Quote'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
