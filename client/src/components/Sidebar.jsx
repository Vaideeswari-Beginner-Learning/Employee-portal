import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    ClipboardList,
    FileText,
    Settings,
    LogOut,
    Shield,
    Navigation,
    MapPin,
    Megaphone,
    MessageSquare,
    Star,
    Layers,
    CalendarDays,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    const getMenuGroups = () => {
        if (isAdmin || isManager) {
            const items = [
                { name: 'Command Center', icon: <LayoutDashboard size={20} />, path: isAdmin ? '/admin-dashboard' : '/manager-dashboard' },
            ];

            if (isAdmin) {
                items.push({ name: 'Personnel Registry', icon: <Users size={20} />, path: '/admin/employees' });
            }

            items.push(
                { name: 'Field Documents', icon: <ClipboardList size={20} />, path: '/admin/reports' },
                { name: 'Absence & Attendance', icon: <CalendarCheck size={20} />, path: '/admin/attendance-hub' },
                { name: 'Live Field Tracker', icon: <Navigation size={20} />, path: '/admin/live-tracker' },
                { name: 'Broadcast System', icon: <Megaphone size={20} />, path: '/admin/announcements' },
                { name: 'Task Assignments', icon: <Layers size={20} />, path: '/admin/tasks' },
                { name: 'Holiday Registry', icon: <CalendarDays size={20} />, path: '/admin/holidays' }
            );

            items.push({ name: 'Personnel Merit', icon: <Star size={20} />, path: '/admin/merit' });

            if (isAdmin) {
                items.push({ name: 'Employee Comms', icon: <MessageSquare size={20} />, path: '/admin/comms' });
            } else {
                items.push({ name: 'Team Comms', icon: <MessageSquare size={20} />, path: '/manager/comms' });
            }

            items.push(
                { name: 'System Settings', icon: <Settings size={20} />, path: '/settings' }
            );

            return [{ title: 'Navigation', items }];
        }

        return [
            {
                title: 'Navigation',
                items: [
                    { name: 'My Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                    { name: 'Field Reports', icon: <ClipboardList size={20} />, path: '/reports' },
                    { name: 'Shift Logs', icon: <CalendarCheck size={20} />, path: '/attendance' },
                    { name: 'Leave Terminal', icon: <FileText size={20} />, path: '/leave' },
                    { name: 'My Tasks', icon: <Layers size={20} />, path: '/tasks' },
                    { name: 'Field Operations', icon: <MapPin size={20} />, path: '/field-ops' },
                    { name: 'Support Node', icon: <MessageSquare size={20} />, path: '/support' },
                    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
                ]
            }
        ];
    };

    const menuGroups = getMenuGroups();

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{ x: isMobile ? (isOpen ? 0 : -240) : 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`w-[240px] h-screen bg-white flex flex-col fixed left-0 top-0 z-50 border-r border-sky-100 shadow-xl shadow-sky-100/50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Background gradient accent */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-white pointer-events-none" />

                {/* Logo Section */}
                <div className="p-6 lg:p-8 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-300/40"
                        >
                            <Shield size={22} className="drop-shadow-sm" />
                        </motion.div>
                        <div>
                            <span className="font-display font-black text-slate-800 tracking-widest text-sm block leading-none uppercase">SK Technology</span>
                        </div>
                    </div>
                    {isMobile && (
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-10 relative z-10">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-1">
                            {group.title && (
                                <div className="px-5 py-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{group.title}</p>
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item, idx) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <motion.button
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                                            whileHover={{ x: 4 }}
                                            onClick={() => {
                                                navigate(item.path);
                                                onClose();
                                            }}
                                            className={`w-full group px-4 py-3 rounded-xl flex items-center gap-4 text-[12px] font-bold transition-all duration-200 relative
                                            ${isActive ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-300/40' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'}`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl -z-10"
                                                />
                                            )}
                                            <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'} transition-colors`}>
                                                {item.icon}
                                            </span>
                                            <span className="tracking-tight">{item.name}</span>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                                                />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Combined Profile & Logout Section */}
                <div className="p-4 border-t border-sky-100 relative z-10 bg-white">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowProfileModal(true)}
                        className="w-full p-4 bg-sky-500 rounded-[1.5rem] flex items-center gap-4 text-left transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 group relative overflow-hidden cursor-pointer active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner group-hover:bg-white/30 transition-all">
                            <Shield size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        </div>

                        <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-[13px] font-black text-white truncate leading-tight mb-0.5">{user?.name || 'Admin'}</p>
                            <p className="text-[9px] font-bold text-sky-100 italic uppercase tracking-widest leading-none">{user?.role || 'Admin'}</p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                logout();
                            }}
                            className="relative z-10 p-2 text-white/80 hover:text-white transition-colors bg-white/10 rounded-xl border border-white/10 hover:border-white/30"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </motion.div>
                </div>
            </motion.aside>

            {/* Profile Modal Overlay */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfileModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-10 overflow-hidden my-auto"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Profile</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Management Hub • {user?.role}</p>
                                </div>
                                <button onClick={() => setShowProfileModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6 p-6 bg-sky-50 rounded-3xl border border-sky-100/50">
                                    <div className="w-20 h-20 rounded-[2rem] bg-sky-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-sky-500/20">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xl font-black text-slate-800 truncate">{user?.name}</p>
                                        <p className="text-sm font-bold text-sky-600 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
                                        <p className="font-bold text-slate-700">Jan 20, 2024</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="font-bold text-emerald-600">Active Duty</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all hover:scale-[1.02] active:scale-95 mt-4"
                                >
                                    Dismiss Node
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
