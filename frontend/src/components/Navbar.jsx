import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LayoutDashboard, LogOut, ShieldCheck, Store, BarChart2, ChevronDown, UserCircle, KeyRound } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <nav className="bg-[#075f47] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Left: logo + nav links */}
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
              {user.role === 'corper' && (
                <Link to="/analytics" className="flex items-center space-x-1 hover:text-green-200 transition-colors">
                  <BarChart2 size={18} />
                  <span>Analytics</span>
                </Link>
              )}
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

          {/* Right: profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user.firstName} {user.lastName}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle size={16} className="text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    to="/profile#security"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeyRound size={16} className="text-gray-400" />
                    Change Password
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
