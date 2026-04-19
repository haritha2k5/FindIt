import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'keys', 'bags', 'other'];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ lost: 0, found: 0, claimed: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', status: '', date: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      params.append('page', String(filters.page));
      params.append('limit', '9');
      const { data } = await api.get(`/items?${params}`);
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Fetch items error:', error);
      setItems([]);
      setTotalPages(1);
      setTotal(0);
    } finally {

      setLoading(false);
    }
  }, [filters]);

  // Fetch quick stats
  useEffect(() => {
    Promise.all([
      api.get('/items?status=lost&limit=1'),
      api.get('/items?status=found&limit=1'),
    ]).then(([l, f]) => {
      setStats({ lost: l.data.total, found: f.data.total, claimed: 0 });
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key: string, val: string) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const hasActiveFilters = filters.category || filters.status || filters.date || filters.search;

  const clearFilters = () => setFilters({ search: '', category: '', status: '', date: '', page: 1 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Campus Lost & Found
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Find What You've Lost
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Browse items reported by the community. Post something you lost or found.
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-6 mb-8">
            {[
              { label: 'Lost Items', value: stats.lost, color: 'text-red-500' },
              { label: 'Found Items', value: stats.found, color: 'text-green-600' },
              { label: 'Total Listings', value: total, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, or location..."
              className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
            />
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Toggle filters"
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="max-w-2xl mx-auto mt-3 flex flex-wrap gap-2 justify-center">
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filters.category} onChange={(e) => set('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filters.status} onChange={(e) => set('status', e.target.value)}
              >
                <option value="">Lost & Found</option>
                <option value="lost">Lost Only</option>
                <option value="found">Found Only</option>
              </select>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
                value={filters.date} onChange={(e) => set('date', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-sm text-gray-500">Filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {filters.category}
                <button onClick={() => set('category', '')}><X size={11} /></button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {filters.status}
                <button onClick={() => set('status', '')}><X size={11} /></button>
              </span>
            )}
            {filters.date && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {filters.date}
                <button onClick={() => set('date', '')}><X size={11} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 underline ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="text-sm text-blue-600 font-medium hover:underline">
              Register to post an item →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-600 font-medium text-lg">No items match your search</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-10">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p}
                onClick={() => setFilters(f => ({ ...f, page: p }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium border transition ${
                  filters.page === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                }`}
              >{p}</button>
            ))}
            <button
              disabled={filters.page === totalPages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
