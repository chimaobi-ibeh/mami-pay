import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LayoutDashboard, LogOut, User, ShieldCheck, Store } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#075f47] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-2xl font-bold tracking-tight">Mami Pay</Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/wallet" className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                <Wallet size={18} />
                <span>Wallet</span>
              </Link>
              {user.role === 'vendor' && (
                <Link to="/vendor" className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                  <Store size={18} />
                  <span>Vendor</span>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                  <ShieldCheck size={18} />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={18} />
              <span className="hidden sm:inline">{user.firstName} {user.lastName}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
