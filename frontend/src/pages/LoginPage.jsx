import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Mail,
    Lock,
    ArrowRight,
    AlertCircle,
    Loader2,
    UserIcon,
    ArrowLeftRight,
    Fingerprint
} from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(email, password);
            if (user?.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('LoginPage caught error:', err);
            const rawError = err.response?.data?.error || err.response?.data?.message || err.message || 'The data frequency does not match. Please verify your credentials.';
            setError(String(rawError));
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
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, -60, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-15%] right-[-10%] w-[50rem] h-[50rem] bg-orange-100/20 rounded-full blur-[150px] pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[500px] z-10 px-4"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-10 md:p-16 relative overflow-hidden">
                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 relative group"
                        >
                            <div className="absolute inset-0 bg-primary-500 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                            <Shield size={40} className="text-primary-500 transform group-hover:rotate-[15deg] transition-transform duration-500" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center">
                                <Fingerprint size={10} className="text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight leading-tight mb-3">
                            Portal<span className="text-primary-500 italic">.Connect</span>
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-[1px] w-4 bg-slate-200" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Integrated HR Ecosystem</p>
                            <div className="h-[1px] w-4 bg-slate-200" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <UserIcon size={12} className="text-primary-400" /> Identifier Node (Email)
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
                                    placeholder="node@ecosystem.local"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/20 transition-all placeholder:text-slate-300 placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Lock size={12} className="text-primary-400" /> Authorization Key
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors duration-300">
                                    <ArrowLeftRight size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/20 transition-all placeholder:text-slate-300"
                                />
                            </div>
                            <div className="flex justify-end pr-1 pt-1">
                                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-wider">Forgot Password?</button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 overflow-hidden"
                                >
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-600 text-xs font-bold leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-6">
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
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Initiate Pulse</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col items-center gap-4">
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-slate-200" />
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center leading-relaxed">
                            Secured Operational Node
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8 px-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Status: <span className="text-emerald-500 animate-pulse">Operational</span>
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        v4.2.0 Final
                    </p>
                </div>
            </motion.div >
        </div >
    );
};

export default LoginPage;
