import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Claim } from '../types';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const statusConfig = {
  pending:  { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock,       label: 'Pending Review' },
  approved: { color: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-50 text-red-600 border-red-200',         icon: XCircle,     label: 'Rejected' },
};

const MyClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims/my')
      .then(({ data }) => setClaims(data.claims))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const counts = {
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of all your submitted claims.</p>
        </div>

        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-600 font-medium text-lg">No claims yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Browse items and submit a claim when you find yours.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Browse Items <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(counts).map(([status, count]) => {
                const cfg = statusConfig[status as keyof typeof statusConfig];
                const Icon = cfg.icon;
                return (
                  <div key={status} className={`rounded-xl border p-4 text-center ${cfg.color}`}>
                    <Icon size={20} className="mx-auto mb-1" />
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium mt-0.5">{cfg.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {claims.map(claim => {
                const cfg = statusConfig[claim.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div key={claim.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-4">
                      {claim.item?.image_url ? (
                        <img src={claim.item.image_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📦</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/items/${claim.item_id}`} className="font-semibold text-gray-800 hover:text-blue-600 block truncate text-sm">
                          {claim.item?.title ?? 'Item'}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Submitted {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {claim.message && (
                          <p className="text-xs text-gray-500 mt-1.5 italic line-clamp-1">"{claim.message}"</p>
                        )}
                      </div>
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                        <Icon size={12} />
                        {cfg.label}
                      </div>
                    </div>
                    {claim.status === 'approved' && (
                      <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-green-600 font-medium flex items-center gap-1.5">
                        <CheckCircle size={13} /> Your claim was approved. Contact the poster to arrange collection.
                      </div>
                    )}
                    {claim.status === 'rejected' && (
                      <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-red-500 flex items-center gap-1.5">
                        <XCircle size={13} /> This claim was not approved. You may try contacting the poster directly.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyClaims;
