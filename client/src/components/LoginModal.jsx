import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginModal = () => {
    const { isLoginModalOpen, setIsLoginModalOpen, login, register, redirectUrl, setRedirectUrl } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isRegister) {
                await register({ name, email, phone, password });
                toast.success("Welcome! Account created successfully.");
            } else {
                await login(email, password);
                toast.success("Welcome back!");
            }
            setIsLoginModalOpen(false);
            if (redirectUrl) {
                navigate(redirectUrl);
                setRedirectUrl(null);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || err.message || (isRegister ? "Registration failed" : "Login failed"));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoginModalOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLoginModalOpen(false)}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                >
                    {/* Header/Banner */}
                    <div className="bg-slate-900 px-8 py-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight">
                                {isRegister ? "Create Account" : "Welcome Back"}
                            </h2>
                            <p className="text-white/60 text-xs font-bold mt-1">
                                {isRegister ? "Join SK Technology for premium security" : "Please log in to continue with your request"}
                            </p>
                        </div>

                        <button 
                            onClick={() => setIsLoginModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegister && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative group">
                                        <LogIn className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors rotate-90" size={16} />
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={16} />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="customer@example.com"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {isRegister && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={16} />
                                        <input 
                                            type="tel" 
                                            required
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={16} />
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-sky-500 hover:shadow-sky-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isRegister ? <LogIn size={16} className="rotate-270" /> : <LogIn size={16} />}
                                        {isRegister ? "Create Account" : "Continue to Login"}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                                {isRegister ? "Already have an account?" : "New to SK Technology?"}
                            </p>
                            <button 
                                onClick={() => {
                                    setError(null);
                                    setIsRegister(!isRegister);
                                }}
                                className="text-sky-500 font-black text-xs uppercase tracking-widest hover:underline"
                            >
                                {isRegister ? "Login instead" : "Create Account"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
