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
    ChevronDown,
    Shield,
    Activity,
    Navigation,
    MapPin,
    Megaphone,
    SquareCheck,
    MessageSquare,
    Star
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
                { name: '📊 Command Center', icon: <LayoutDashboard size={20} />, path: '/admin-dashboard' },
            ];

            if (isAdmin) {
                items.push({ name: '👥 Personnel Registry', icon: <Users size={20} />, path: '/admin/employees' });
            }

            items.push(
                { name: '📂 Field Documents', icon: <ClipboardList size={20} />, path: '/admin/reports' },
                { name: '📅 Absence & Attendance', icon: <CalendarCheck size={20} />, path: '/admin/attendance-hub' },
                { name: '📍 Live Field Tracker', icon: <Navigation size={20} />, path: '/admin/live-tracker' },
                { name: '📢 Broadcast System', icon: <Megaphone size={20} />, path: '/admin/announcements' },
                { name: '✅ Task Assignments', icon: <SquareCheck size={20} />, path: '/admin/tasks' }
            );

            if (isAdmin) {
                items.push({ name: '⭐ Personnel Merit', icon: <Star size={20} />, path: '/admin/merit' });
            }

            // Comms page differs by role
            if (isAdmin) {
                items.push({ name: '💬 Employee Comms', icon: <MessageSquare size={20} />, path: '/admin/comms' });
            } else {
                items.push({ name: '💬 Team Comms', icon: <MessageSquare size={20} />, path: '/manager/comms' });
            }

            items.push(
                { name: '⚙️ System Settings', icon: <Settings size={20} />, path: '/settings' }
            );

            return [{ title: 'Protocol Navigation', items }];
        }

        return [
            {
                title: 'Protocol Navigation',
                items: [
                    { name: '📊 My Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                    { name: '📂 Field Reports', icon: <ClipboardList size={20} />, path: '/reports' },
                    { name: '📅 Shift Logs', icon: <CalendarCheck size={20} />, path: '/attendance' },
                    { name: '📄 Leave Terminal', icon: <FileText size={20} />, path: '/leave' },
                    { name: '✅ My Tasks', icon: <SquareCheck size={20} />, path: '/tasks' },
                    { name: '📍 Field Operations', icon: <MapPin size={20} />, path: '/field-ops' },
                    { name: '💬 Support Node', icon: <MessageSquare size={20} />, path: '/support' },
                    { name: '⚙️ Identity Matrix', icon: <Settings size={20} />, path: '/settings' },
                ]
            }
        ];
    };

    const menuGroups = getMenuGroups();

    return (
        <aside className="w-[240px] h-screen bg-slate-900 flex flex-col fixed left-0 top-0 z-50 text-slate-400 border-r border-slate-800 shadow-2xl">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                    <Shield size={22} className="drop-shadow-sm" />
                </div>
                <div>
                    <span className="font-display font-black text-white tracking-widest text-sm block leading-none uppercase">SK Technology</span>
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] mt-1 block tracking-tighter">Admin Portal</span>
                </div>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-8 mb-4">
                <div className="bg-slate-800/40 rounded-[1.5rem] p-5 border border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Activity size={40} className="text-white" />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-lg font-black text-white shadow-inner uppercase">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-900 rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-black text-white truncate leading-tight mb-1">{user?.name}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto sidebar-scroll pb-10">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-2">
                        {group.title && (
                            <div className="px-5 py-2 flex items-center gap-4">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap">{group.title}</p>
                                <div className="h-px bg-slate-800 flex-1 opacity-50" />
                            </div>
                        )}
                        <div className="space-y-1 relative">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full group px-5 py-3.5 rounded-2xl flex items-center gap-4 text-[13px] font-bold transition-all duration-300 relative overflow-hidden z-10
                                            ${isActive
                                                ? 'bg-primary-500 text-white active-nav-indicator'
                                                : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                                    >
                                        <span className={`${isActive ? 'text-white' : 'text-slate-600 group-hover:text-primary-400'} transition-colors duration-300`}>
                                            {item.icon}
                                        </span>
                                        <span className="tracking-tight">{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-hover"
                                                className="ml-auto w-1.5 h-1.5 bg-white/50 rounded-full"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Session Footer */}
            <div className="p-6 border-t border-slate-800/50">
                <button
                    onClick={logout}
                    className="w-full px-5 py-4 rounded-2xl flex items-center gap-4 text-[13px] font-black text-red-400 hover:bg-red-500/5 transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase tracking-[0.1em]">Terminate</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
