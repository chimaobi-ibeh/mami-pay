import React from 'react';
import { Store, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';

const VendorDashboard = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500">Manage your business and track sales.</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Package size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-[#075f47] rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Sales</p>
          <h2 className="text-2xl font-bold text-gray-900">₦0.00</h2>
          <p className="mt-2 text-xs text-green-600 font-medium">+0% this week</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Orders</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-blue-600 font-medium">0 pending</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Customers</p>
          <h2 className="text-2xl font-bold text-gray-900">0</h2>
          <p className="mt-2 text-xs text-purple-600 font-medium">0 new this month</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Store size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Store Rating</p>
          <h2 className="text-2xl font-bold text-gray-900">5.0</h2>
          <p className="mt-2 text-xs text-orange-600 font-medium">Excellent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-6">Recent Orders</h3>
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
            <p>No orders yet.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-6">Top Products</h3>
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>No products listed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
