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
    MessageSquare,
    Star,
    Layers
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
                { name: 'Task Assignments', icon: <Layers size={20} />, path: '/admin/tasks' }
            );

            items.push({ name: 'Personnel Merit', icon: <Star size={20} />, path: '/admin/merit' });

            // Comms page differs by role
            if (isAdmin) {
                items.push({ name: 'Employee Comms', icon: <MessageSquare size={20} />, path: '/admin/comms' });
            } else {
                items.push({ name: 'Team Comms', icon: <MessageSquare size={20} />, path: '/manager/comms' });
            }

            items.push(
                { name: 'System Settings', icon: <Settings size={20} />, path: '/settings' }
            );

            return [{ title: 'Protocol Navigation', items }];
        }

        return [
            {
                title: 'Protocol Navigation',
                items: [
                    { name: 'My Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                    { name: 'Field Reports', icon: <ClipboardList size={20} />, path: '/reports' },
                    { name: 'Shift Logs', icon: <CalendarCheck size={20} />, path: '/attendance' },
                    { name: 'Leave Terminal', icon: <FileText size={20} />, path: '/leave' },
                    { name: 'My Tasks', icon: <Layers size={20} />, path: '/tasks' },
                    { name: 'Field Operations', icon: <MapPin size={20} />, path: '/field-ops' },
                    { name: 'Support Node', icon: <MessageSquare size={20} />, path: '/support' },
                    { name: 'Identity Matrix', icon: <Settings size={20} />, path: '/settings' },
                ]
            }
        ];
    };

    const menuGroups = getMenuGroups();

    return (
        <aside className="w-[240px] h-screen bg-[#0F172A] flex flex-col fixed left-0 top-0 z-50 text-slate-400 border-r border-white/5 shadow-2xl">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Shield size={22} className="drop-shadow-sm" />
                </div>
                <div>
                    <span className="font-display font-black text-white tracking-widest text-sm block leading-none uppercase">SK Technology</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1 block tracking-tighter">Admin Portal</span>
                </div>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-6 border-b border-white/5 mb-4 bg-white/5">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-sm uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#0F172A] rounded-full"></div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-black text-white truncate leading-tight mb-1">{user?.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{user?.role}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto sidebar-scroll pb-10">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-2">
                        {group.title && (
                            <div className="px-5 py-2">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.title}</p>
                            </div>
                        )}
                        <div className="space-y-1 relative">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full group px-5 py-3 rounded-xl flex items-center gap-4 text-[12px] font-bold transition-all duration-200 relative
                                            ${isActive
                                                ? 'bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/20'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <span className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'} transition-colors`}>
                                            {item.icon}
                                        </span>
                                        <span className="tracking-tight">{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Session Footer */}
            <div className="p-6 border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full px-5 py-3 rounded-xl flex items-center gap-4 text-[12px] font-black text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase tracking-widest font-bold">Terminate</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
