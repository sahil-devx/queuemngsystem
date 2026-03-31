// src/components/Layout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ListOrdered,
  Menu,
  X,
  User
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin#dashboard-section' },
        { icon: ListOrdered, label: 'My Queues', path: '/admin#my-queues-section' },
        { icon: Users, label: 'Customers', path: '/admin#users-section' },
        { icon: Settings, label: 'Settings', path: '/admin#settings-section' }
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/user#dashboard-section' },
        { icon: ListOrdered, label: 'My Queues', path: '/user#joined-section' },
        { icon: Settings, label: 'Settings', path: '/user#settings-section' }
      ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    const hash = path.split('#')[1];
    if (!hash) return;
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className={`
              fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40
              ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}
              w-64
            `}
          >
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Q</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Queue System</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} Panel</p>
                </div>
              </motion.div>
            </div>

            {/* User Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 border-b border-slate-200"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getImageUrl(user?.profilePicture)}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                      location.hash === `#${item.path.split('#')[1]}`
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                    }`}
                  >
                    <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </motion.div>
              ))}
            </nav>

            {/* Logout */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200"
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="lg:ml-64 p-6"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}