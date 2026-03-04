import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CalendarCheck,
    FileText,
    Clock,
    Shield,
    ArrowRight,
    Activity,
    ClipboardCheck
} from 'lucide-react';

const AttendanceHub = () => {
    const navigate = useNavigate();

    const hubItems = [
        {
            title: "Global Attendance",
            desc: "Monitor real-time shifts, check-ins, and personnel duty logs across all nodes.",
            icon: <CalendarCheck size={32} />,
            path: "/admin/attendance",
            color: "from-emerald-500 to-emerald-600",
            shadow: "shadow-emerald-500/20",
            metric: "Registry.Live"
        },
        {
            title: "Leave Approvals",
            desc: "Review and authorize personnel absence requests and clearance protocols.",
            icon: <FileText size={32} />,
            path: "/admin/leaves",
            color: "from-amber-500 to-amber-600",
            shadow: "shadow-amber-500/20",
            metric: "Auth.Pending"
        },
        {
            title: "Leave Terminal",
            desc: "Access the unified leave management system for internal administrative use.",
            icon: <Clock size={32} />,
            path: "/leave",
            color: "from-primary-500 to-primary-600",
            shadow: "shadow-primary-500/20",
            metric: "Terminal.Active"
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight leading-none">
                        Absence<span className="text-primary-500 italic">.Registry</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                        <Shield size={12} className="text-primary-500" />
                        Personnel Operational Management Hub
                    </p>
                </div>
                <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Secure Node
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hubItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(item.path)}
                        className="group relative cursor-pointer"
                    >
                        {/* Shadow Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500`} />

                        <div className="card-premium h-full p-8 flex flex-col bg-white/60 backdrop-blur-md border border-white relative z-10 hover:translate-y-[-4px] transition-all duration-500">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                    {item.icon}
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.metric}</p>
                                    <div className="flex justify-end gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-1 h-1 rounded-full ${i === 1 ? 'bg-primary-500' : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-display font-black text-slate-800 mb-3 group-hover:text-primary-500 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-8 flex-1">
                                {item.desc}
                            </p>

                            <div className="pt-6 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-500 transition-colors">Launch Module</span>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Insight Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="card-premium p-8 bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                    <Activity size={120} />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                            <ClipboardCheck size={28} className="text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-black tracking-tight mb-1">Operational Integration</h3>
                            <p className="text-xs font-medium text-slate-400 max-w-sm">
                                All personnel data is synchronized with the Global Control Node. Unauthorized shifts are flagged in real-time.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-slate-800 hidden sm:block" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated Security Protocol Active</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AttendanceHub;
