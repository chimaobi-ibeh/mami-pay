import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LayoutDashboard, LogOut, ShieldCheck, Store, BarChart2, ChevronDown, UserCircle, Settings } from 'lucide-react';

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
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#075f47] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-[#075f47] tracking-tight">Mami Pay</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex space-x-1">
              <Link to="/dashboard" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-[#075f47] hover:bg-green-50 transition-colors text-sm font-medium">
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </Link>
              <Link to="/wallet" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-[#075f47] hover:bg-green-50 transition-colors text-sm font-medium">
                <Wallet size={17} />
                <span>Wallet</span>
              </Link>
              {user.role === 'corper' && (
                <Link to="/analytics" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-[#075f47] hover:bg-green-50 transition-colors text-sm font-medium">
                  <BarChart2 size={17} />
                  <span>Analytics</span>
                </Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/vendor" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-[#075f47] hover:bg-green-50 transition-colors text-sm font-medium">
                  <Store size={17} />
                  <span>Vendor</span>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-[#075f47] hover:bg-green-50 transition-colors text-sm font-medium">
                  <ShieldCheck size={17} />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-[#075f47] text-white px-3 py-1.5 rounded-lg hover:bg-[#064e3b] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user.firstName} {user.lastName}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#075f47] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
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
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Settings
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
