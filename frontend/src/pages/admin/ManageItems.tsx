import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Item } from '../../types';
import { ArrowLeft } from 'lucide-react';

const ManageItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/items/admin/pending');
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id: string) => {
    try {
      await api.patch(`/items/${id}/approve`);
      toast.success('Item approved');
      fetchPending();
    } catch { toast.error('Failed to approve'); }
  };

  const reject = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item rejected and deleted');
      fetchPending();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Pending Approvals {!loading && <span className="text-gray-400 font-normal">({items.length})</span>}
      </h1>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>No pending items. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {item.image_url ? (
                  <img src={item.image_url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                )}
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.category} · {item.location}</p>
                  <p className="text-xs text-gray-400">By {item.owner?.name} · {item.status} · {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => approve(item.id)}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 font-medium">
                  Approve
                </button>
                <button onClick={() => reject(item.id)}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 font-medium">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageItems;
