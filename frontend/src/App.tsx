import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import MyClaims from './pages/MyClaims';
import MyItems from './pages/MyItems';
import Dashboard from './pages/admin/Dashboard';
import ManageItems from './pages/admin/ManageItems';
import ManageClaims from './pages/admin/ManageClaims';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/items/:id" element={<ItemDetail />} />

            {/* Protected - regular users */}
            <Route path="/post" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
            <Route path="/my-claims" element={<ProtectedRoute><MyClaims /></ProtectedRoute>} />
            <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />

            {/* Protected - admin only */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/items" element={<ProtectedRoute requiredRole="admin"><ManageItems /></ProtectedRoute>} />
            <Route path="/admin/claims" element={<ProtectedRoute requiredRole="admin"><ManageClaims /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
