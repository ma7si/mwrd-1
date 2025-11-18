import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();

  const [role, setRole] = useState<'client' | 'supplier'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'client' || roleParam === 'supplier') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      role,
      real_name: realName,
      company_name: companyName || undefined,
      phone: phone || undefined,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#e5e7eb] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created and is pending approval from our team. You'll receive an email once your account is activated.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-[#0A2540] text-white font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        <div className="w-full lg:w-1/2 p-12 lg:p-16">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-[#0A2540] rounded-lg flex items-center justify-center">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <span className="text-2xl font-bold text-[#0A2540]">mwrd</span>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
              <p className="text-gray-500">Join the managed B2B marketplace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      role === 'client'
                        ? 'border-[#0A2540] bg-[#0A2540]/5 text-[#0A2540]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Client</div>
                    <div className="text-xs mt-1 text-gray-600">I need to buy</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supplier')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      role === 'supplier'
                        ? 'border-[#0A2540] bg-[#0A2540]/5 text-[#0A2540]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Supplier</div>
                    <div className="text-xs mt-1 text-gray-600">I want to sell</div>
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Work Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A2540] transition-colors"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A2540] transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Full Name / Contact Person"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A2540] transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A2540] transition-colors"
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A2540] transition-colors"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Your account will be reviewed by our team before activation. This usually takes 24-48 hours.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0A2540] text-white font-semibold rounded-lg hover:bg-[#0A2540]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#4A90E2] hover:text-[#357ABD] font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 text-left max-w-md">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Join the Future of B2B Commerce.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Connect with verified partners, streamline your operations, and grow your business in a secure ecosystem built for efficiency and trust.
            </p>
          </div>

          <div className="absolute bottom-8 right-8 opacity-10">
            <svg width="120" height="120" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
