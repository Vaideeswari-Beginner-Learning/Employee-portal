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
            } else if (user?.role === 'customer') {
                navigate('/home');
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
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
                type: 'spring',
                stiffness: 100
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
        <div className="min-h-screen w-full flex items-center justify-center bg-sky-50 relative overflow-hidden font-sans p-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[5%] w-[40rem] h-[40rem] bg-sky-300 rounded-full blur-[100px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -45, 0],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[5%] w-[50rem] h-[50rem] bg-blue-400 rounded-full blur-[120px] pointer-events-none"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[440px] z-10"
            >
                <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(14,165,233,0.15)] border border-white p-8 md:p-12 relative overflow-hidden group">
                    {/* Glowing Accent */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl transition-all group-hover:bg-sky-400/30" />
                    
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="text-center mb-10">
                        <div className="inline-flex relative mb-8">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="w-20 h-20 rounded-3xl bg-sky-500 flex items-center justify-center relative shadow-2xl shadow-sky-300"
                            >
                                <Shield size={36} className="text-white" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white rounded-3xl blur-md"
                                />
                            </motion.div>
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            Portal<span className="text-sky-500">.Login</span>
                        </h1>
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">SK Technology Grid</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identifier */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={12} className="text-sky-500" /> Identity Node
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter system email"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all outline-none"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Lock size={12} className="text-sky-500" /> Access Key
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <ArrowLeftRight size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all outline-none"
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-black text-sky-500 hover:text-sky-600 transition-colors uppercase tracking-[0.1em]">Forgot Key?</button>
                            </div>
                        </motion.div>

                        {/* Error Handling */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <AlertCircle size={16} className="text-rose-500 mt-0.5" />
                                    <p className="text-rose-500 text-xs font-bold leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Action */}
                        <motion.div variants={itemVariants} className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-sky-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-sky-200 hover:bg-sky-600 transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Initialize Access <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </div>

                {/* Status Footer */}
                <motion.div variants={itemVariants} className="flex justify-between items-center mt-10 px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grid Operational</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v4.5 Secure</span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
