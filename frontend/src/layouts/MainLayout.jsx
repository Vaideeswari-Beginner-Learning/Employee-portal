import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
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
        <div className="h-screen w-screen flex items-center justify-center bg-white mesh-gradient">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-b-2 border-primary-500"
            />
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex min-h-screen bg-[#f8fafb] font-sans">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 lg:ml-[240px] flex flex-col">
                {/* Top Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 fixed top-0 right-0 left-0 lg:left-[240px] z-40 px-8 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-6 flex-1">
                        <button className="lg:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500">
                            <Menu size={20} />
                        </button>
                        <div className="relative max-w-lg w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-5 pr-8 border-r border-slate-100">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative cursor-pointer text-slate-400 hover:text-primary-500 transition-colors"
                            >
                                <Bell size={22} />
                                {announcementsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm leading-none">
                                        {announcementsCount}
                                    </span>
                                )}
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-6">
                            <motion.div
                                whileHover={{ y: -1 }}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-100 transition-colors">
                                    <User size={20} />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">Workspace</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.email === 'admin@cctv.com' ? 'ADMIN' : 'EMPLOYEE'}</p>
                                </div>
                            </motion.div>
                            <button
                                onClick={logout}
                                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Terminate Session"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="p-10 max-w-[1600px] mx-auto w-full flex-grow mt-20">
                    <Outlet />
                </main>

                {/* Footer Section */}
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
