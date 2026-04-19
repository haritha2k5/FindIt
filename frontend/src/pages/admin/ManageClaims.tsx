import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Claim } from '../../types';
import { ArrowLeft } from 'lucide-react';

const ManageClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims').then(({ data }) => setClaims(data.claims)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/claims/${id}`, { status });
      toast.success(`Claim ${status}`);
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
    } catch { toast.error('Failed to update claim'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <h1 className="text-xl font-bold text-gray-800 mb-6">All Claims</h1>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No claims yet.</div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">
                    Item: <Link to={`/items/${claim.item_id}`} className="text-blue-600 hover:underline">{claim.item?.title}</Link>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Claimed by: <span className="font-medium">{claim.claimant?.name}</span> ({claim.claimant?.email})
                  </p>
                  {claim.message && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 italic">"{claim.message}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(claim.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{claim.status}</span>
                  {claim.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(claim.id, 'approved')}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600">Approve</button>
                      <button onClick={() => updateStatus(claim.id, 'rejected')}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600">Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageClaims;
