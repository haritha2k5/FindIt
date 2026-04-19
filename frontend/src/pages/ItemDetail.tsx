import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';
import { MapPin, Calendar, Tag, User as UserIcon, ArrowLeft } from 'lucide-react';

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

  //  DELETE FUNCTION
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Delete this item?');
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
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const isOwner = user?.id === item.user_id;

  // FIXED CLAIM LOGIC
  const canClaim =
    isAuthenticated &&
    item.status === 'found' &&
    user?.role !== 'admin' &&
    user?.id !== item.user_id &&
    !claimed;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          {/* Image */}
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-4" />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              📦 No image
            </div>
          )}

          {/* Title + Status */}
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
              {item.status}
            </span>
          </div>

          {/* Owner label */}
          {isOwner && (
            <p className="text-xs text-blue-600 mb-3">Your listing</p>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-4">{item.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
            <p><Tag size={14} className="inline mr-1" /> {item.category}</p>
            <p><MapPin size={14} className="inline mr-1" /> {item.location}</p>
            <p><Calendar size={14} className="inline mr-1" /> {new Date(item.date).toLocaleDateString()}</p>
            <p><UserIcon size={14} className="inline mr-1" /> {item.owner?.name}</p>
          </div>

          {/* DELETE BUTTON */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="mb-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete Item
            </button>
          )}

          {/* Claimed */}
          {item.status === 'claimed' && (
            <p className="text-gray-500 mb-4">This item has been claimed</p>
          )}

          {/* Claim success */}
          {claimed && (
            <p className="text-green-600 mb-4">Claim submitted successfully!</p>
          )}

          {/* CLAIM FORM */}
          {canClaim && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Submit a Claim</h3>

              <textarea
                className="w-full border rounded-lg p-2 mb-3"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                {claiming ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          )}

          {/* Login prompt */}
          {!isAuthenticated && item.status === 'found' && (
            <p className="text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-blue-600 font-medium">Login</Link> to claim this item
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ItemDetail;