import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedRoute = ({ user, onLogout, children, requiredRole }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
};

export default ProtectedRoute;
