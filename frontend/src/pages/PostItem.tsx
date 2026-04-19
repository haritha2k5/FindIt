import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Upload, X, ImageIcon } from 'lucide-react';

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'keys', 'bags', 'other'];

const PostItem = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'other',
    location: '', date: '', status: 'lost',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const setFile = (file: File | null) => {
    if (!file) { setImage(null); setPreview(null); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images allowed'); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    setFile(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) { toast.error('Please select a date'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item posted! Awaiting admin approval.');
      navigate('/my-items');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post an Item</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details. An admin will review and approve it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">What are you reporting?</label>
            <div className="grid grid-cols-2 gap-3">
              {(['lost', 'found'] as const).map(s => (
                <button
                  key={s} type="button"
                  onClick={() => f('status', s)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
                    form.status === s
                      ? s === 'lost'
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-green-50 border-green-400 text-green-700'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {s === 'lost' ? '😟 I Lost Something' : '🎉 I Found Something'}
                </button>
              ))}
            </div>
          </div>

          {/* Item info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Item Details</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Title *</label>
              <input
                type="text" required placeholder="e.g. Blue water bottle, iPhone 14..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title} onChange={(e) => f('title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Description *</label>
              <textarea
                rows={3} required placeholder="Describe the item in detail — color, size, distinguishing features..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.description} onChange={(e) => f('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Category *</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.category} onChange={(e) => f('category', e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Date *</label>
                <input
                  type="date" required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.date} onChange={(e) => f('date', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Location *</label>
              <input
                type="text" required placeholder="e.g. Main Library, Block A Canteen, Sports Ground..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.location} onChange={(e) => f('location', e.target.value)}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Photo <span className="text-gray-400 font-normal">(optional, helps a lot)</span>
            </label>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="preview" className="w-full h-52 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {image?.name}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  {dragging ? <Upload size={28} className="text-blue-500" /> : <ImageIcon size={28} />}
                  <p className="text-sm font-medium text-gray-500">
                    {dragging ? 'Drop it here!' : 'Click or drag & drop a photo'}
                  </p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 5MB</p>
                </div>
                <input
                  ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              '🚀 Submit Item for Review'
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your item will appear publicly after admin approval — usually within a few hours.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
