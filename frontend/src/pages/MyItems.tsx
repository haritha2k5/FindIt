import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Item } from '../types';

const statusColor = (s: string) =>
  s === 'lost' ? 'bg-red-100 text-red-600' :
  s === 'found' ? 'bg-green-100 text-green-600' :
  'bg-gray-100 text-gray-500';

const MyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items/my').then(({ data }) => setItems(data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Posted Items</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>You haven't posted any items yet.</p>
          <Link to="/post" className="text-blue-600 mt-2 inline-block font-medium">Post your first item →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {item.image_url ? (
                  <img src={item.image_url} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                )}
                <div className="min-w-0">
                  <Link to={`/items/${item.id}`} className="font-medium text-gray-800 hover:text-blue-600 truncate block">
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-500">{item.category} · {item.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(item.status)}`}>
                  {item.status}
                </span>
                {item.is_approved ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600 border border-green-200">
                    ✓ Approved
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                    ⏳ Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;
