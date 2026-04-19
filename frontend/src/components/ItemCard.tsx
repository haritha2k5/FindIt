import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { Item } from '../types';

const statusStyles: Record<string, string> = {
  lost: 'bg-red-100 text-red-600',
  found: 'bg-emerald-100 text-emerald-700',
  claimed: 'bg-gray-100 text-gray-500',
};

const ItemCard = ({ item }: { item: Item }) => (
  <Link
    to={`/items/${item.id}`}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden block"
  >
    <div className="relative">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center text-gray-300 gap-1">
          <span className="text-4xl">📦</span>
          <span className="text-xs text-gray-300">No image</span>
        </div>
      )}
      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[item.status] || statusStyles.claimed}`}>
        {item.status.toUpperCase()}
      </span>
    </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-semibold text-gray-800 truncate text-sm group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Tag size={11} className="text-gray-400 flex-shrink-0" />
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <Calendar size={11} className="text-gray-300 flex-shrink-0" />
          {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {item.owner && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
            {item.owner.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 truncate">Posted by {item.owner.name}</span>
        </div>
      )}
    </div>
  </Link>
);

export default ItemCard;
