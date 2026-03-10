import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const MainLayout = () => {
    const { user, loading, logout } = useAuth();
    const [announcementsCount, setAnnouncementsCount] = useState(0);

    useEffect(() => {
        if (user) {
            api.get('announcements')
                .then(res => setAnnouncementsCount(res.data.length))
                .catch(err => console.error('Error fetching announcements:', err));
        }
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-14 w-14 border-4 border-sky-200 border-t-sky-500"
                />
                <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]"
                >
                    Initializing...
                </motion.p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 font-sans text-slate-800">
            {/* Subtle floating orbs for visual depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-100/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 lg:ml-[240px] flex flex-col relative z-10">
                {/* Top Navbar */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-20 bg-white/80 backdrop-blur-xl border-b border-sky-100 fixed top-0 right-0 left-0 lg:left-[240px] z-40 px-8 flex items-center justify-between shadow-sm shadow-sky-100/50"
                >
                    <div className="flex items-center gap-6 flex-1">
                        <button className="lg:hidden p-2 hover:bg-sky-50 rounded-xl transition-colors text-sky-600">
                            <Menu size={20} />
                        </button>
                        <div className="relative max-w-lg w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-12 pr-4 py-2.5 bg-sky-50 border border-sky-200 rounded-2xl text-sm text-slate-700 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all placeholder-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-5 pr-8 border-r border-sky-100">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer text-sky-500 hover:text-sky-600 transition-colors"
                            >
                                <Bell size={22} />
                                {announcementsCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                                    >
                                        {announcementsCount}
                                    </motion.span>
                                )}
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-6">
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-200">
                                    <User size={20} />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">Workspace</p>
                                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{user?.role}</p>
                                </div>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content Area */}
                <main className="p-10 max-w-[1600px] mx-auto w-full flex-grow mt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={typeof window !== 'undefined' ? window.location.pathname : ''}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer Section */}
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
