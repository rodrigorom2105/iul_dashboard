import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { auth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
