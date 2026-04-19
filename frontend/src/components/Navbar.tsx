import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, LayoutDashboard, Search, Package, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Search size={22} /> LostAndFound
        </Link>

        <div className="flex items-center gap-3">

          {/* Always visible */}
          <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
            Browse
          </Link>

          {isAuthenticated ? (
            <>
              {/* ✅ USER ONLY FEATURES */}
              {!isAdmin && (
                <>
                  <Link
                    to="/post"
                    className="flex items-center gap-1 text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    <PlusCircle size={15} /> Post Item
                  </Link>

                  <Link
                    to="/my-items"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Package size={15} /> My Items
                  </Link>

                  <Link
                    to="/my-claims"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <ClipboardList size={15} /> My Claims
                  </Link>
                </>
              )}

              {/* ✅ ADMIN ONLY */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium border border-purple-200 px-2.5 py-1 rounded-lg"
                >
                  <LayoutDashboard size={15} /> Admin Panel
                </Link>
              )}

              {/* User info + logout */}
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                <span className="text-sm text-gray-500">
                  Hi, <span className="font-medium text-gray-700">{user?.name}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>

              <Link
                to="/register"
                className="text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;