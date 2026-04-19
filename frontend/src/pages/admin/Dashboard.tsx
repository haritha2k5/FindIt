import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ClipboardList, Tag, Users, AlertCircle, Clock } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalItems: number;
  pendingItems: number;
  totalClaims: number;
  pendingClaims: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  const cards = [
    {
      to: '/admin/items',
      icon: Tag,
      color: 'blue',
      title: 'Manage Items',
      desc: 'Approve or reject item listings',
      badge: stats?.pendingItems ?? null,
      badgeLabel: 'pending',
    },
    {
      to: '/admin/claims',
      icon: ClipboardList,
      color: 'green',
      title: 'Manage Claims',
      desc: 'Review and resolve user claims',
      badge: stats?.pendingClaims ?? null,
      badgeLabel: 'pending',
    },
    {
      to: '/admin/users',
      icon: Users,
      color: 'purple',
      title: 'Manage Users',
      desc: 'View all users and manage roles',
      badge: stats?.totalUsers ?? null,
      badgeLabel: 'total',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
      <p className="text-gray-400 mb-8">Manage the Lost & Found platform</p>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600' },
            { label: 'Total Items', value: stats.totalItems, icon: Tag, color: 'text-blue-600' },
            { label: 'Pending Items', value: stats.pendingItems, icon: Clock, color: 'text-orange-500' },
            { label: 'Pending Claims', value: stats.pendingClaims, icon: AlertCircle, color: 'text-red-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <Icon size={22} className={color} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map(({ to, icon: Icon, color, title, desc, badge, badgeLabel }) => (
          <Link key={to} to={to}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`${colorMap[color]} p-3 rounded-xl`}>
                <Icon size={22} />
              </div>
              {badge !== null && badge !== undefined && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  badgeLabel === 'pending' && badge > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {badge} {badgeLabel}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
