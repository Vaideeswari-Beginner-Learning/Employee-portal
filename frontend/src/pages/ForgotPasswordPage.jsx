import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Mail,
    ArrowRight,
    AlertCircle,
    Loader2,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import api from '../utils/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setIsLoading(true);

        try {
            const response = await api.post('auth/forgot-password', { email });
            setStatus({ type: 'success', message: response.data.message || 'Reset link sent to your email!' });
            setEmail('');
        } catch (err) {
            const rawError = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            setStatus({ type: 'error', message: typeof rawError === 'object' ? JSON.stringify(rawError) : String(rawError) });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafb] mesh-gradient relative overflow-hidden font-sans">
            {/* Animated Particles/Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-primary-100/30 rounded-full blur-[120px] pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[500px] z-10 px-4"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-10 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

                    <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-500 uppercase tracking-widest mb-8 transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>

                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mb-6 flex-shrink-0 relative group shadow-sm">
                            <Shield size={28} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-tight mb-2">
                            Reset Password
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Enter your email to receive a password recovery link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Mail size={12} className="text-primary-400" /> Registration Email
                            </label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors duration-300">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/20 transition-all placeholder:text-slate-300 placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className={`border rounded-2xl p-4 flex items-start gap-3 overflow-hidden ${status.type === 'error' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}
                                >
                                    {status.type === 'error' ? (
                                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                    )}
                                    <p className={`text-xs font-bold leading-relaxed ${status.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                                        {status.message}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-2xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]"
                            >
                                <div className="absolute inset-0 bg-primary-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <div className="relative bg-primary-500 group-hover:bg-transparent text-white py-5 px-6 flex items-center justify-center gap-3 transition-all duration-300">
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">Send Reset Link</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
