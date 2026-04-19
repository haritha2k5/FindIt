import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { isAuthenticated, user } = useAuth();

  //  Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (requiredRole && user?.role !== requiredRole) {
    // 🔥 Smart redirect
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Access allowed
  return <>{children}</>;
};

export default ProtectedRoute;