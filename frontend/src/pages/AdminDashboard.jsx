import React from 'react';
import { ShieldCheck, Users, Activity, Settings, AlertCircle, FileText } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System-wide overview and management.</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#075f47] rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Users</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">0 active now</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Transactions</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-blue-600 font-medium">0 failed</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">System Alerts</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-red-600 font-medium">All systems normal</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Security Score</p>
          <h2 className="text-2xl font-bold text-gray-900">98%</h2>
          <p className="mt-2 text-xs text-purple-600 font-medium">Excellent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Audit Logs</h3>
            <button className="text-[#075f47] text-sm font-medium hover:underline flex items-center space-x-1">
              <FileText size={16} />
              <span>Export Logs</span>
            </button>
          </div>
          <div className="text-center py-12 text-gray-400">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p>No audit logs found.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">API Server</span>
              <span className="text-xs font-bold text-[#075f47] uppercase">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <span className="text-xs font-bold text-[#075f47] uppercase">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Auth Service</span>
              <span className="text-xs font-bold text-[#075f47] uppercase">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
              <span className="text-xs font-bold text-[#075f47] uppercase">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
