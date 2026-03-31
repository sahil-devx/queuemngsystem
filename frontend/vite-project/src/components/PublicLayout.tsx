// src/components/PublicLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Heart, Crown, User, LogOut, LogIn, UserPlus, Layout, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
            </motion.div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Queue System</p>
              <p className="text-xs text-slate-500">Fast, fair, simple</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg text-sm font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md">
                  <UserPlus className="w-4 h-4" />
                  Get started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{user?.name}</span>
                  <Crown className="w-3 h-3 text-amber-500" />
                </div>
                <Link to={user?.role === 'admin' ? '/admin' : '/user'} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                  <Layout className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-3 space-y-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Home</Link>
              <a href="#how-it-works" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">How it works</a>
              <a href="#features" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Features</a>
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white text-center">Get started</Link>
                </>
              ) : (
                <>
                  <Link to={user?.role === 'admin' ? '/admin' : '/user'} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Dashboard</Link>
                  <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">Q</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold">Queue System</p>
                  <p className="text-sm text-slate-400">Modern queue management</p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm text-slate-300 leading-relaxed">
                Create fair, transparent queues for your team or service. Users join in seconds, 
                admins manage with one-click actions, and everyone stays informed.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white mb-4">Product</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Multi-queue admin</li>
                <li className="hover:text-white transition-colors cursor-pointer">Search & join</li>
                <li className="hover:text-white transition-colors cursor-pointer">Completed history</li>
                <li className="hover:text-white transition-colors cursor-pointer">Role-based dashboards</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white mb-4">Support</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">help@queuesystem.com</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-6 text-xs text-slate-500 md:flex-row">
            <p>© {new Date().getFullYear()} Queue System. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-400" /> using React + Tailwind + Framer Motion
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}