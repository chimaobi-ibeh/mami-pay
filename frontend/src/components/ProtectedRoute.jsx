import { Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedRoute = ({ user, onLogout, children, requiredRole }) => {
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <div key={location.pathname} className="container mx-auto px-4 py-8 page-enter">{children}</div>
    </div>
  );
};

export default ProtectedRoute;
