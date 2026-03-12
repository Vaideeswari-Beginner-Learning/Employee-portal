import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MainLayout = () => {
    const { user, loading, logout } = useAuth();
    const [announcementsCount, setAnnouncementsCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (user) {
            api.get('announcements')
                .then(res => setAnnouncementsCount(res.data.length))
                .catch(err => console.error('Error fetching announcements:', err));

            // Evening Report Reminder Logic
            const checkEveningReminder = () => {
                const now = new Date();
                const currentHour = now.getHours();
                const today = now.toLocaleDateString();
                const lastReminder = localStorage.getItem('lastEveningReportReminder');

                // Get prefs from localStorage
                const savedPrefs = localStorage.getItem('notificationPrefs');
                const prefs = savedPrefs ? JSON.parse(savedPrefs) : { reports: false };

                if (currentHour >= 18 && prefs.reports && lastReminder !== today) {
                    toast('📋 Reporting Protocol: Data Entry Pending', {
                        icon: '⚠️',
                        duration: 6000,
                        style: {
                            borderRadius: '16px',
                            background: '#0ea5e9',
                            color: '#fff',
                            fontWeight: 'black',
                            textTransform: 'uppercase',
                            fontSize: '10px',
                            letterSpacing: '0.1em'
                        },
                    });
                    localStorage.setItem('lastEveningReportReminder', today);
                }
            };

            // Run check on mount and then every 30 minutes
            checkEveningReminder();
            const interval = setInterval(checkEveningReminder, 1800000); // 30 mins
            return () => clearInterval(interval);
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
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 lg:ml-[240px] flex flex-col relative z-10">
                {/* Top Navbar */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-20 bg-white/80 backdrop-blur-xl border-b border-sky-100 fixed top-0 right-0 left-0 lg:left-[240px] z-40 px-4 md:px-8 flex items-center shadow-sm shadow-sky-100/50"
                >
                    <div className="flex-1 flex items-center justify-between w-full">
                        {/* Hamburger Menu - Left */}
                        <div className="flex-shrink-0 lg:hidden">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 hover:bg-sky-50 rounded-xl transition-colors text-sky-600"
                            >
                                <Menu size={20} />
                            </button>
                        </div>

                        {/* Search - Centered on Mobile, Left-aligned on Desktop */}
                        <div className="flex-1 flex justify-center lg:justify-start px-2 sm:px-4">
                            <div className="relative max-w-xl w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 bg-sky-50 border border-sky-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all placeholder-slate-400 outline-none shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Actions - Right */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer text-sky-500 hover:text-sky-600 transition-colors bg-sky-50 p-2 sm:p-2.5 rounded-xl border border-sky-100"
                            >
                                <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />
                                {announcementsCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-sky-500 text-white text-[8px] sm:text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                                    >
                                        {announcementsCount}
                                    </motion.span>
                                )}
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="hidden lg:flex p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all border border-sky-100 bg-white"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content Area */}
                <main className="p-3 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full flex-grow mt-20">
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
