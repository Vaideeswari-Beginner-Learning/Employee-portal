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
    Activity,
    Flag,
    Building2,
    Gift,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TaskStatusChart from '../../components/TaskStatusChart';
import { AnimatePresence } from 'framer-motion';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [selectedHoliday, setSelectedHoliday] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [annRes, tasksRes, holidayRes] = await Promise.all([
                    api.get('announcements'),
                    api.get('tasks'),
                    api.get('employee/holidays')
                ]);
                setAnnouncements(annRes.data);
                setTasks(tasksRes.data);
                setHolidays(holidayRes.data);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-sky-50 min-h-screen p-4 sm:p-6 md:p-10 relative">
            {/* Holiday Detail Modal */}
            <AnimatePresence>
                {selectedHoliday && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedHoliday(null)}
                        className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] shadow-2xl border border-sky-100 w-full max-w-md overflow-hidden"
                        >
                            <div className="h-24 bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-between px-8">
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Holiday Purpose</h2>
                                    <p className="text-[10px] text-sky-100 font-bold uppercase tracking-widest">{selectedHoliday.title}</p>
                                </div>
                                <button onClick={() => setSelectedHoliday(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                        {selectedHoliday.description || "The management has assigned this day as a holiday for the respective purpose mentioned above. All employees are advised to plan accordingly."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="text-xs font-black text-slate-800">{new Date(selectedHoliday.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex-1 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                        <p className="text-xs font-black text-sky-600 uppercase tracking-widest">{selectedHoliday.type}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedHoliday(null)} className="w-full py-4 bg-sky-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-sky-300/40">Acknowledge</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Company Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-800 tracking-tight uppercase leading-none">
                        Command<span className="text-sky-500 italic">.Center</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Operational Identity Node: {user?.employeeId || '002'}</p>
                </div>
                <div className="flex items-center gap-4 bg-sky-50 px-5 py-2.5 rounded-2xl border border-sky-100 backdrop-blur-xl shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Secure</span>
                </div>
            </div>

            {/* Profile Information Card */}
            <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                    <Shield size={200} className="text-slate-800" />
                </div>

                <div className="relative">
                    <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[2.5rem] p-1 sm:p-1.5 bg-gradient-to-tr from-indigo-500/20 to-indigo-500/5 shadow-2xl">
                        <div className="w-full h-full rounded-[1.2rem] sm:rounded-[2rem] bg-sky-50 overflow-hidden border-2 sm:border-4 border-sky-100 flex items-center justify-center text-3xl sm:text-5xl font-display font-black text-sky-500 uppercase shadow-inner">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/settings')}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-sky-500 text-slate-800 flex items-center justify-center shadow-2xl border-4 border-slate-900 cursor-pointer"
                    >
                        <Edit2 size={16} />
                    </motion.div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight mb-1 uppercase">{user?.name}</h1>
                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">{user?.role || 'Executive Protocol'}</p>
                        </div>
                        <div className="space-y-3">
                            <InfoLine label="Internal ID" value={user?.employeeId || 'EMP-2026-002'} />
                            <InfoLine label="Designation" value="Senior Field Engineer" />
                            <InfoLine label="Access Node" value="Main Terminal" />
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        <div className="space-y-3 pt-10">
                            <InfoLine label="Tenure Status" value="PERMANENT CYCLE" />
                            <InfoLine label="Sync Period" value="Aug 2023 - Present" />
                            <InfoLine label="Efficiency" value="98.4%" />
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-center sm:items-end gap-6 text-center sm:text-right w-full">
                        <div className="w-full">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Administrative Core</p>
                            <h3 className="text-xl sm:text-2xl font-display font-black text-slate-800 uppercase tracking-tight">Operations</h3>
                            <p className="text-[10px] font-black text-sky-500 mt-2 flex items-center gap-2 justify-center sm:justify-end uppercase tracking-widest">
                                <MapPin size={12} /> Regional Hub Alpha
                            </p>
                        </div>
                        <button onClick={() => navigate('/settings')} className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95">Synchronize Profile</button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Contact Information */}
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] h-full flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20 shadow-inner">
                                        <Mail size={18} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Communication Nodes</h3>
                                </div>
                                <Plus size={16} className="text-slate-500 cursor-pointer hover:text-sky-500 transition-colors" />
                            </div>
                            <div className="p-8 flex-1 space-y-6">
                                <div className="p-5 bg-sky-50 border border-sky-100 rounded-2xl group hover:border-sky-500/30 transition-colors shadow-inner">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        Primary Vector <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    </p>
                                    <p className="text-sm font-black text-slate-800">{user?.email}</p>
                                </div>
                                <button onClick={() => navigate('/settings')} className="w-full py-4 text-[10px] font-black text-sky-500 border border-sky-100 rounded-2xl hover:bg-sky-500 hover:text-slate-800 transition-all uppercase tracking-widest shadow-xl">Register New Vector</button>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] h-full flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Geospatial Registry</h3>
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-sky-50 rounded-3xl flex items-center justify-center mb-6 text-slate-700 shadow-inner border border-sky-100">
                                    <MapPin size={32} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 mb-8 leading-relaxed px-4 uppercase tracking-[0.2em]">No physical coordinates registered in the system database.</p>
                                <button onClick={() => navigate('/field-ops')} className="w-full py-4 text-[10px] font-black text-orange-400 border border-sky-100 rounded-2xl hover:bg-orange-500 hover:text-slate-800 transition-all uppercase tracking-widest shadow-xl">Open Field Tracker</button>
                            </div>
                        </div>
                    </div>

                    {/* Holiday Section */}
                    <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                                    <Calendar size={18} />
                                </div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Holiday Registry</h3>
                            </div>
                            <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Year: {new Date().getFullYear()}</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { type: 'government', label: 'Government', icon: Flag, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                                { type: 'company', label: 'Company', icon: Building2, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
                            ].map(t => {
                                const latest = holidays.filter(h => h.type === t.type).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                                return (
                                    <div
                                        key={t.type}
                                        onClick={() => latest && setSelectedHoliday(latest)}
                                        className={`p-5 rounded-2xl border ${t.bg} ${t.border} flex items-center justify-between cursor-pointer hover:shadow-lg transition-all active:scale-95 group`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 bg-white rounded-xl shadow-sm ${t.color}`}>
                                                <t.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.label} Holiday</p>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{latest ? latest.title : 'No Upcoming'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[14px] font-black text-slate-700 leading-none">{latest ? new Date(latest.date).getDate() : '--'}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">{latest ? new Date(latest.date).toLocaleString('default', { month: 'short' }) : 'N/A'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="px-6 pb-6 space-y-3">
                            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                                        <Gift size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optional Leave Protocol</p>
                                </div>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200">Active</span>
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
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 pl-1">Global Broadcasts</h3>
                        <div className="space-y-4">
                            {announcements.length > 0 ? announcements.slice(0, 3).map((ann) => (
                                <div key={ann._id} className="bg-white/40 backdrop-blur-md p-6 border-l-4 border-l-indigo-600 border border-sky-100 rounded-2xl shadow-xl hover:bg-white/60 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm ${ann.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-sky-500/20 text-sky-500 border border-sky-600/20'}`}>
                                            {ann.priority}
                                        </span>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                            {new Date(ann.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 mb-1">{ann.title}</h4>
                                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                                </div>
                            )) : (
                                <div className="p-10 text-center bg-sky-50 rounded-[2rem] border border-dashed border-sky-100 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Zero Broadcast Vectors Detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 pl-1">Telemetry Stream</h3>
                        <div className="space-y-8 relative pl-4">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-sky-50 shadow-inner" />

                            <ActivityCard
                                type="PERMANENT CYCLE"
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
        <span className="text-xs font-black text-slate-800 uppercase tracking-tight tabular-nums">{value}</span>
    </div>
);

const ModuleBadge = ({ color, name, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-2xl hover:border-primary-500/30 hover:bg-sky-100 transition-all cursor-pointer group shadow-xl ${onClick ? 'active:scale-95' : ''}`}>
        <div className={`w-3 h-3 rounded-full ${color} shadow-lg group-hover:scale-125 transition-transform`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-400 transition-colors">{name}</span>
    </div>
);

const ActivityCard = ({ type, color, icon, title, subtitle, time, author }) => (
    <div className="relative group">
        <div className={`absolute -left-[25px] top-4 w-7 h-7 rounded-xl ${color} flex items-center justify-center text-slate-800 border-4 border-slate-900 shadow-2xl group-hover:scale-110 transition-transform z-10`}>
            {icon}
        </div>
        <div className="bg-white/40 backdrop-blur-md p-6 border border-sky-100 rounded-2xl shadow-xl hover:bg-white/60 transition-all group-hover:border-primary-500/30">
            <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-black ${color.replace('bg-', 'text-')} uppercase tracking-widest`}>{type}</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{time}</span>
            </div>
            <h4 className="text-sm font-black text-slate-800 mb-1 leading-tight tracking-tight uppercase">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">{subtitle}</p>
            <div className="flex items-center gap-2 pt-4 border-t border-sky-100">
                <div className="w-6 h-6 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center text-[10px] font-black text-sky-500 shadow-inner">
                    {author?.charAt(0)}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{author}</span>
            </div>
        </div>
    </div>
);

export default EmployeeDashboard;


