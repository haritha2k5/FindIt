import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Item } from '../types';
import { Trash2, PlusCircle, ExternalLink } from 'lucide-react';

const statusStyle: Record<string, string> = {
  lost:    'bg-red-100 text-red-600',
  found:   'bg-emerald-100 text-emerald-700',
  claimed: 'bg-gray-100 text-gray-500',
};

const MyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    api.get('/items/my')
      .then(({ data }) => setItems(data.items))
      .catch(() => toast.error('Failed to load your items'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted.');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
            <p className="text-sm text-gray-500 mt-1">All items you've posted — track their status here.</p>
          </div>
          <Link
            to="/post"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle size={16} /> Post Item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-700 font-semibold text-lg mb-1">Nothing posted yet</p>
            <p className="text-gray-400 text-sm mb-6">Post a lost or found item to get started.</p>
            <Link
              to="/post"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <PlusCircle size={15} /> Post your first item
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between gap-4 transition ${
                  confirmId === item.id ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
              >
                {/* Left: image + info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {item.image_url ? (
                    <img src={item.image_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" alt="" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to={`/items/${item.id}`}
                      className="font-semibold text-gray-800 hover:text-blue-600 truncate text-sm flex items-center gap-1 group">
                      {item.title}
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition flex-shrink-0" />
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.category} · {item.location}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right: badges + delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[item.status] || 'bg-gray-100 text-gray-500'}`}>
                    {item.status.toUpperCase()}
                  </span>
                  {!item.is_approved ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                      ⏳ Pending
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600 border border-green-200">
                      ✓ Live
                    </span>
                  )}

                  {/* Delete confirm inline */}
                  {confirmId === item.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                      >Cancel</button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 font-semibold"
                      >
                        {deletingId === item.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(item.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                      title="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;
