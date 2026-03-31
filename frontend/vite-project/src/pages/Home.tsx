// src/pages/Home.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: Users, title: 'Multi-Queue Admin', description: 'Create and manage multiple queues for different services' },
    { icon: Clock, title: 'Real-time Updates', description: 'Get instant updates on your queue position' },
    { icon: CheckCircle2, title: 'Fair System', description: 'First come, first served with transparent tracking' },
    { icon: Zap, title: 'Fast & Simple', description: 'Join queues in seconds with one-click actions' },
    { icon: Shield, title: 'Secure Access', description: 'Role-based dashboards for admins and users' },
    { icon: TrendingUp, title: 'Analytics', description: 'Track queue performance and wait times' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-brand-500/20 to-purple-500/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-600">Smart Queue Management</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
              Modern Queue
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent"> Management</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Create fair, transparent queues for your business. Users join in seconds, 
              admins manage with one-click actions, and everyone stays informed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Queues', icon: Users },
              { number: '50K+', label: 'Happy Users', icon: Users },
              { number: '99.9%', label: 'Uptime', icon: Shield },
              { number: '< 2s', label: 'Response Time', icon: Zap },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-brand-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900">{stat.number}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple steps to manage your queues efficiently</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Queue', description: 'Admins create queues for different services', icon: Users },
              { step: '2', title: 'Join Queue', description: 'Users search and join available queues', icon: Clock },
              { step: '3', title: 'Get Served', description: 'Admins call next user when ready', icon: CheckCircle2 },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="relative text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-slate-600">Everything you need for modern queue management</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to streamline your queues?
            </h2>
            <p className="text-slate-300 mb-8">
              Join thousands of businesses using Queue System for efficient queue management.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}