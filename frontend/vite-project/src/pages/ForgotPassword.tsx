import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import api from '../api/client';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const startResendCooldown = () => {
    setResendIn(30);
    const timer = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email });
      setSuccess(res.data?.message || 'OTP sent to your email.');
      setDevOtp(String(res.data?.devOtp || ''));
      setStep('otp');
      startResendCooldown();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email || resendIn > 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email });
      setSuccess(res.data?.message || 'OTP resent successfully.');
      setDevOtp(String(res.data?.devOtp || ''));
      startResendCooldown();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', { email, otp });
      setSuccess(res.data?.message || 'OTP verified successfully.');
      setStep('reset');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setLoading(false);
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await api.post('/auth/forgot-password/reset', { email, newPassword });
      setSuccess(res.data?.message || 'Password reset successful.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
            <p className="text-sm text-slate-500 mt-1">
              {step === 'email' && 'Enter your email to receive a 6-digit OTP'}
              {step === 'otp' && 'Check your email and verify OTP'}
              {step === 'reset' && 'Set your new password'}
            </p>
          </div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          ) : null}
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
            >
              {success}
            </motion.div>
          ) : null}
          {devOtp ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm"
            >
              Dev OTP: <span className="font-semibold tracking-[0.25em]">{devOtp}</span>
            </motion.div>
          ) : null}

          {step === 'email' && (
            <form onSubmit={submitEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md disabled:opacity-70"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </motion.button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={submitOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 tracking-[0.3em]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>
              <button
                type="button"
                onClick={() => void resendOtp()}
                disabled={loading || resendIn > 0}
                className="w-full py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={submitReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all shadow-md disabled:opacity-70"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
