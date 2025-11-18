import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function Unauthorized() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            You don't have permission to access this area. Please contact support if you believe this is an error.
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(-1)} variant="secondary" className="w-full">
              Go Back
            </Button>
            <Button onClick={handleSignOut} variant="ghost" className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
