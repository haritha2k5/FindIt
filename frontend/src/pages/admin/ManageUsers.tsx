import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { User } from '../../types';
import { ArrowLeft, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

  const toggleRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${u.name}'s role to "${newRole}"?`)) return;
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      toast.success(`${u.name} is now ${newRole}`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole as 'user' | 'admin' } : x));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        All Users {!loading && <span className="text-gray-400 font-normal">({users.length})</span>}
      </h1>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${u.role === 'admin' ? 'bg-purple-100' : 'bg-blue-50'}`}>
                  {u.role === 'admin' ? <Shield size={18} className="text-purple-600" /> : <UserIcon size={18} className="text-blue-500" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{u.name} {u.id === me?.id && <span className="text-xs text-gray-400">(you)</span>}</p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.role}
                </span>
                {u.id !== me?.id && (
                  <button
                    onClick={() => toggleRole(u)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium border transition ${
                      u.role === 'admin'
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
