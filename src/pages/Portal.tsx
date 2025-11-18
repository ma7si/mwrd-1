import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Portal() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  switch (profile.role) {
    case 'client':
      return <Navigate to="/portal/client" replace />;
    case 'supplier':
      return <Navigate to="/portal/supplier" replace />;
    case 'admin':
      return <Navigate to="/portal/admin" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
