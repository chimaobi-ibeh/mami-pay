import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VendorDirectory = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchVendors = async (p = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 12, search, category }).toString();
      const res = await api.get(`/api/vendor/directory?${q}`, config);
      setVendors(res.data.vendors || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(1); }, []); // eslint-disable-line

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchVendors(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Directory</h1>
        <p className="text-gray-500">Find vendors and pay directly from their profile.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or shop" className="w-full border-none focus:ring-0" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2">
          <option value="">All categories</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Services">Services</option>
        </select>
        <button className="btn-primary px-4 py-2">Filter</button>
      </form>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No vendors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="card border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase text-gray-500">Vendor</p>
                  <h3 className="font-bold text-gray-900">{vendor.shopName || `${vendor.firstName} ${vendor.lastName}`}</h3>
                  <p className="text-sm text-gray-500">{vendor.shopCategory || 'General'}</p>
                </div>
                <button onClick={() => navigate(`/pay/vendor/${vendor.id}`)} className="text-[#075f47] text-xs font-semibold">Pay →</button>
              </div>
              <p className="text-sm text-gray-600 mt-3">{vendor.shopDescription || 'No description yet.'}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><MapPin size={14} /> {vendor.email}</div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => fetchVendors(page - 1)} className="px-3 py-2 border rounded-lg">Prev</button>
          <span className="px-3 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => fetchVendors(page + 1)} className="px-3 py-2 border rounded-lg">Next</button>
        </div>
      )}
    </div>
  );
};

export default VendorDirectory;
