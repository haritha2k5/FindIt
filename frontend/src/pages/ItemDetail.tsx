import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';
import { MapPin, Calendar, Tag, User as UserIcon, ArrowLeft, Phone } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(({ data }) => setItem(data.item))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await api.post(`/claims/${id}`, { message });
      toast.success('Claim submitted! Admin will review it.');
      setMessage('');
      setClaimed(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Delete this item? This cannot be undone.');
    if (!confirmDelete) return;
    try {
      await api.delete(`/items/${item?.id}`);
      toast.success('Item deleted successfully');
      navigate('/my-items');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 font-medium">Item not found</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block hover:underline">← Back to listings</Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = user?.id === item.user_id;

  // BUG FIX: original code only allowed claiming on status === 'found'.
  // Both lost and found items should be claimable by non-owners:
  //   - FOUND item → someone lost it and wants to claim it back
  //   - LOST item  → someone found it and wants to say "I have this"
  const canClaim =
    isAuthenticated &&
    !isOwner &&
    user?.role !== 'admin' &&
    item.status !== 'claimed' &&
    item.is_approved &&
    !claimed;

  // Wording changes based on the item type so the action makes sense
  const claimCopy = item.status === 'lost'
    ? {
        heading: 'Did you find this item?',
        placeholder: 'Describe where and when you found it. The admin will connect you with the owner.',
        btn: 'Report That I Found It',
      }
    : {
        heading: 'Is this item yours?',
        placeholder: 'Describe how this item belongs to you — details only the true owner would know.',
        btn: 'Submit My Claim',
      };

  const statusStyle =
    item.status === 'lost'    ? 'bg-red-100 text-red-600' :
    item.status === 'found'   ? 'bg-emerald-100 text-emerald-700' :
                                'bg-gray-100 text-gray-500';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to listings
        </Link>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          {/* Image */}
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-4" />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-400">
              📦 No image provided
            </div>
          )}

          {/* Title + Status */}
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle}`}>
              {item.status.toUpperCase()}
            </span>
          </div>

          {isOwner && (
            <p className="text-xs text-blue-600 mb-3 font-medium">Your listing</p>
          )}

          <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-gray-600">
            <p className="flex items-center gap-1.5"><Tag size={13} className="text-gray-400" /> {item.category}</p>
            <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {item.location}</p>
            <p className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> {new Date(item.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="flex items-center gap-1.5"><UserIcon size={13} className="text-gray-400" /> {item.owner?.name}</p>
          </div>

          {/* Contact Info — only on lost items */}
          {item.status === 'lost' && item.contact_info && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Phone size={15} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-0.5">Found it? Call the owner directly</p>
                <a href={`tel:${item.contact_info}`} className="text-blue-700 font-bold text-base hover:underline">
                  {item.contact_info}
                </a>
              </div>
              <a href={`tel:${item.contact_info}`}
                className="flex-shrink-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                Call Now
              </a>
            </div>
          )}

          {/* Delete button — owner only */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="mb-5 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium transition"
            >
              Delete this post
            </button>
          )}

          {/* Claimed banner */}
          {item.status === 'claimed' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-gray-600 font-medium text-sm">This item has already been claimed</p>
              <p className="text-gray-400 text-xs mt-1">No longer available for new claims.</p>
            </div>
          )}

          {/* Claim success */}
          {claimed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-emerald-700 font-medium text-sm">Claim submitted successfully!</p>
              <p className="text-emerald-600 text-xs mt-1">
                Track it in <Link to="/my-claims" className="underline font-semibold">My Claims</Link>. Admin will review it.
              </p>
            </div>
          )}

          {/* Claim form — for non-owners on non-claimed approved items */}
          {canClaim && (
            <div className="border-t pt-5">
              <h3 className="font-semibold text-gray-800 mb-1">{claimCopy.heading}</h3>
              <p className="text-sm text-gray-400 mb-3">{claimCopy.placeholder}</p>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Add details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
              >
                {claiming
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  : claimCopy.btn
                }
              </button>
            </div>
          )}

          {/* Owner note — owner can't claim their own */}
          {isOwner && item.status !== 'claimed' && (
            <p className="text-xs text-gray-400 mt-4 border-t pt-4">You cannot claim your own post.</p>
          )}

          {/* Not logged in prompt */}
          {!isAuthenticated && item.status !== 'claimed' && (
            <p className="text-sm text-gray-500 mt-4 border-t pt-4 text-center">
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>{' '}
              to {item.status === 'lost' ? 'report that you found this' : 'claim this item'}
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
