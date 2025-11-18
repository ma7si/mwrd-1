import { useNavigate } from 'react-router-dom';
import { Clock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function PendingApproval() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Under Review</h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for registering with mwrd! Your account is currently being reviewed by our team.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 text-left">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">What happens next?</p>
                <ul className="space-y-1.5 text-blue-800">
                  <li>• Our team will review your information</li>
                  <li>• You'll receive an email once approved</li>
                  <li>• Approval typically takes 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {profile && (
            <div className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <p>Registered as: <span className="font-medium text-gray-700">{profile.real_name}</span></p>
              <p>Account type: <span className="font-medium text-gray-700 capitalize">{profile.role}</span></p>
            </div>
          )}

          <Button onClick={handleSignOut} variant="secondary" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
