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
    User,
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
            if (user?.role === 'admin' || user?.role === 'manager') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('LoginPage caught error:', err);
            const rawError = err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed';
            setError(typeof rawError === 'object' ? JSON.stringify(rawError) : String(rawError));
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans p-6 md:p-12">
            {/* Background Architecture */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60rem] h-[60rem] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -45, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[70rem] h-[70rem] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"
                />
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[460px] z-10"
            >
                <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 p-8 md:p-14 relative overflow-hidden group">
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/[0.02] to-transparent h-24 w-full -translate-y-full group-hover:animate-scanline pointer-events-none" />
                    
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="text-center mb-10">
                        <div className="inline-flex relative mb-8">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-20 h-20 rounded-3xl bg-slate-900 border border-sky-500/30 flex items-center justify-center relative shadow-2xl shadow-sky-500/20"
                            >
                                <Shield size={36} className="text-sky-400" />
                                <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-sky-400 rounded-3xl blur-xl"
                                />
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-xl border-2 border-slate-800 flex items-center justify-center shadow-lg">
                                    <Fingerprint size={12} className="text-amber-500" />
                                </div>
                            </motion.div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight uppercase mb-2">
                            Secure<span className="text-sky-500 italic">.Access</span>
                        </h1>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Node Communication Terminal</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identifier Node */}
                        <motion.div variants={itemVariants} className="space-y-2.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={12} className="text-sky-500" /> Identifier
                            </label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors duration-300">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter system identifier"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/40 transition-all placeholder:text-slate-600 placeholder:font-medium"
                                />
                            </div>
                        </motion.div>

                        {/* Authorization Key */}
                        <motion.div variants={itemVariants} className="space-y-2.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={12} className="text-sky-500" /> Auth-Key
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors duration-300">
                                    <ArrowLeftRight size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/40 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <div className="flex justify-end pr-1 pt-1">
                                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[9px] font-black text-sky-500 hover:text-sky-400 transition-colors uppercase tracking-[0.1em]">Recovery Assist</button>
                            </div>
                        </motion.div>

                        {/* Error Handling */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-xs font-black uppercase tracking-tight leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Primary */}
                        <motion.div variants={itemVariants} className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-2xl h-[3.8rem] bg-sky-500 transition-all shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)] active:shadow-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin text-slate-900 mx-auto" size={24} />
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-[11px] font-black text-slate-950 uppercase tracking-[0.4em]">Initialize Pulse</span>
                                        <ArrowRight size={20} className="text-slate-950 group-hover:translate-x-1.5 transition-transform" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Footer Metrics */}
                    <motion.div variants={itemVariants} className="mt-12 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                    className="w-1.5 h-1.5 rounded-full bg-sky-500"
                                />
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] text-center">
                            Encrypted Gateway Alpha
                        </p>
                    </motion.div>
                </div>

                {/* System Status Indicators */}
                <motion.div variants={itemVariants} className="flex justify-between items-center mt-8 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sys.Operational</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">v4.2.0 Final Build</span>
                </motion.div>
            </motion.div >
        </div >
    );
};
export default LoginPage;

