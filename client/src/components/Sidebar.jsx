import { useState } from 'react';
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
    CalendarDays
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
        <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-[240px] h-screen bg-white flex flex-col fixed left-0 top-0 z-50 border-r border-sky-100 shadow-xl shadow-sky-100/50"
        >
            {/* Background gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-white pointer-events-none" />

            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3 relative z-10">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-300/40"
                >
                    <Shield size={22} className="drop-shadow-sm" />
                </motion.div>
                <div>
                    <span className="font-display font-black text-slate-800 tracking-widest text-sm block leading-none uppercase">SK Technology</span>
                    <span className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.2em] mt-1 block">Admin Portal</span>
                </div>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-5 mb-4 bg-gradient-to-r from-sky-50 to-blue-50 border-y border-sky-100 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-lg font-black text-white shadow-md shadow-sky-200/50 uppercase"
                        >
                            {user?.name?.charAt(0)}
                        </motion.div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-[3px] border-white rounded-full shadow-sm" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-800 truncate leading-tight mb-1">{user?.name}</p>
                        <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest leading-none">{user?.role}</p>
                    </div>
                </div>
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
                                        onClick={() => navigate(item.path)}
                                        className={`w-full group px-4 py-3 rounded-xl flex items-center gap-4 text-[12px] font-bold transition-all duration-200 relative
                                            ${isActive
                                                ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-300/40'
                                                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'}`}
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

            {/* Session Footer */}
            <div className="p-5 border-t border-sky-100 relative z-10">
                <motion.button
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="w-full px-5 py-3 rounded-xl flex items-center gap-4 text-[12px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase tracking-widest">Sign Out</span>
                </motion.button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
