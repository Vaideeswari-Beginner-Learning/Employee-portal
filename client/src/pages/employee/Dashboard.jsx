import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Phone,
    Mail,
    MapPin,
    Edit2,
    Plus,
    Calendar,
    Clock,
    FileText,
    Settings,
    Shield,
    LayoutDashboard,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TaskStatusChart from '../../components/TaskStatusChart';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [annRes, tasksRes] = await Promise.all([
                    api.get('announcements'),
                    api.get('tasks')
                ]);
                setAnnouncements(annRes.data);
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header / Company Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">
                        Command<span className="text-primary-500 italic">.Center</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Operational Identity Node: {user?.employeeId || '002'}</p>
                </div>
                <div className="flex items-center gap-4 bg-white/50 px-5 py-2.5 rounded-2xl border border-slate-100/50 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Secure</span>
                </div>
            </div>

            {/* Profile Information Card */}
            <div className="card-premium p-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
                    <Shield size={200} className="text-slate-900" />
                </div>

                <div className="relative">
                    <div className="w-40 h-40 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-primary-100 to-primary-50 shadow-xl shadow-primary-500/10">
                        <div className="w-full h-full rounded-[2rem] bg-white overflow-hidden border-4 border-white flex items-center justify-center text-5xl font-display font-black text-primary-200 uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/settings')}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg border-4 border-white cursor-pointer"
                    >
                        <Edit2 size={16} />
                    </motion.div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight mb-1">{user?.name}</h1>
                            <p className="text-sm font-bold text-primary-500 uppercase tracking-widest">{user?.role || 'Executive Protocol'}</p>
                        </div>
                        <div className="space-y-3">
                            <InfoLine label="Internal ID" value={user?.employeeId || 'EMP-2026-002'} />
                            <InfoLine label="Designation" value="Senior Field Engineer" />
                            <InfoLine label="Access Node" value="Main Terminal" />
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        <div className="space-y-3 pt-10">
                            <InfoLine label="Tenure Status" value="Full Cycle" />
                            <InfoLine label="Sync Period" value="Aug 2023 - Present" />
                            <InfoLine label="Efficiency" value="98.4%" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-6 text-right">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Administrative Core</p>
                            <h3 className="text-2xl font-display font-black text-slate-700">Operations</h3>
                            <p className="text-xs font-bold text-primary-600 mt-2 flex items-center gap-2 justify-end">
                                <MapPin size={12} /> Regional Hub Alpha
                            </p>
                        </div>
                        <button onClick={() => navigate('/settings')} className="btn-teal w-full sm:w-auto">Synchronize Profile</button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Contact Information */}
                        <div className="card-premium h-full flex flex-col">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 rounded-lg text-primary-500">
                                        <Mail size={18} />
                                    </div>
                                    <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">Communication Nodes</h3>
                                </div>
                                <Plus size={16} className="text-slate-300 cursor-pointer hover:text-primary-500 transition-colors" />
                            </div>
                            <div className="p-8 flex-1 space-y-6">
                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:border-primary-100 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        Primary Vector <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{user?.email}</p>
                                </div>
                                <button onClick={() => navigate('/settings')} className="w-full py-4 text-[10px] font-black text-primary-500 border-2 border-primary-500/10 rounded-2xl hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest">Register New Vector</button>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="card-premium h-full flex flex-col">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">Geospatial Registry</h3>
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                                    <MapPin size={32} />
                                </div>
                                <p className="text-xs font-bold text-slate-400 mb-8 leading-relaxed px-4 uppercase tracking-tighter">No physical coordinates registered in the system database.</p>
                                <button onClick={() => navigate('/field-ops')} className="w-full py-4 text-[10px] font-black text-orange-500 border-2 border-orange-500/10 rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase tracking-widest">Open Field Tracker</button>
                            </div>
                        </div>
                    </div>

                    {/* Lower Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Modules Section */}
                        <div className="card-premium">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                    <LayoutDashboard size={18} />
                                </div>
                                <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">Active Protocols</h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <ModuleBadge color="bg-amber-400" name="Briefing" onClick={() => navigate('/attendance')} />
                                <ModuleBadge color="bg-rose-500" name="Absence" onClick={() => navigate('/leave')} />
                                <ModuleBadge color="bg-orange-500" name="Inventory" onClick={() => navigate('/reports')} />
                                <ModuleBadge color="bg-emerald-500" name="Hierarchy" onClick={() => navigate('/settings')} />
                            </div>
                        </div>

                        {/* Custom Fields */}
                        <div className="card-premium">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                                    <FileText size={18} />
                                </div>
                                <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">System Metadata</h3>
                            </div>
                            <div className="p-8">
                                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Activity size={40} className="text-white" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Field Classification</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-xs font-bold text-slate-400">Deployment Logic:</p>
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary-500/20">Remote Synced</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column / Activity & Announcements */}
                <div className="space-y-10">
                    <div className="animate-in fade-in slide-in-from-right-5 duration-700 delay-300">
                        <TaskStatusChart tasks={tasks} />
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.3em] mb-8 pl-1">Global Broadcasts</h3>
                        <div className="space-y-4">
                            {announcements.length > 0 ? announcements.slice(0, 3).map((ann) => (
                                <div key={ann._id} className="card-premium p-6 border-l-4 border-l-primary-500 bg-white/50 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${ann.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'}`}>
                                            {ann.priority}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {new Date(ann.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 mb-1">{ann.title}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2">{ann.content}</p>
                                </div>
                            )) : (
                                <div className="p-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">No Active Broadcasts</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.3em] mb-8 pl-1">Telemetry Stream</h3>
                        <div className="space-y-8 relative pl-4">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 shadow-inner" />

                            <ActivityCard
                                type="Absence Synced"
                                color="bg-rose-500"
                                icon={<Calendar size={12} />}
                                title="Operation: Reset"
                                subtitle="Family Protocol Engaged"
                                time="2 hours ago"
                                author={user?.name}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoLine = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{value}</span>
    </div>
);

const ModuleBadge = ({ color, name, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-primary-100 hover:bg-primary-50/10 transition-all cursor-pointer group shadow-sm ${onClick ? 'active:scale-95' : ''}`}>
        <div className={`w-3 h-3 rounded-lg ${color} shadow-sm group-hover:scale-125 transition-transform`} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-primary-500 transition-colors">{name}</span>
    </div>
);

const ActivityCard = ({ type, color, icon, title, subtitle, time, author }) => (
    <div className="relative group">
        <div className={`absolute -left-[25px] top-4 w-7 h-7 rounded-xl ${color} flex items-center justify-center text-white border-4 border-[#f8fafb] shadow-lg group-hover:scale-110 transition-transform z-10`}>
            {icon}
        </div>
        <div className="card-premium p-6 group-hover:border-primary-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-black ${color.replace('bg-', 'text-')} uppercase tracking-widest`}>{type}</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{time}</span>
            </div>
            <h4 className="text-sm font-black text-slate-800 mb-1 leading-tight">{title}</h4>
            <p className="text-xs font-medium text-slate-500 mb-4">{subtitle}</p>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                    {author?.charAt(0)}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{author}</span>
            </div>
        </div>
    </div>
);

export default EmployeeDashboard;
