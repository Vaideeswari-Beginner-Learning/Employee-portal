import { useState, useEffect, useRef } from 'react';
import {
    Users, CalendarCheck, FileText,
    AlertCircle, TrendingUp, Clock,
    Search, Download, ChevronRight,
    Activity, Megaphone, Building2, UserCircle2, Briefcase, UserCheck, CheckCircle,
    ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, ArrowDown
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TaskStatusChart from '../../components/TaskStatusChart';

gsap.registerPlugin(useGSAP);

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        todayAttendance: 0,
        pendingLeaves: 0,
        todayReports: 0
    });
    const [tasks, setTasks] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const containerRef = useRef();

    useGSAP(() => {
        if (gsap.utils.toArray('.stat-card').length > 0) {
            gsap.fromTo('.stat-card',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }

        if (gsap.utils.toArray('.stagger-item').length > 0) {
            gsap.fromTo('.stagger-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
            );
        }
    }, { scope: containerRef, dependencies: [stats, tasks] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, tasksRes] = await Promise.all([
                    api.get('admin/dashboard-stats'),
                    api.get('tasks')
                ]);
                setStats(statsRes.data);
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };
        fetchData();
    }, []);

    const convertToCSV = (data, headersList) => {
        if (!data || !data.length) return headersList.join(',');

        // Strict CSV converter guarantees column matching
        const csvRows = [
            headersList.join(','),
            ...data.map(row =>
                headersList.map(header => {
                    let cell = row[header] === null || row[header] === undefined ? '' : row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    cell = cell.toString().replace(/"/g, '""');
                    if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
                    return cell;
                }).join(',')
            )
        ];
        return csvRows.join('\n');
    };

    const handleSystemAudit = async () => {
        setIsExporting(true);
        try {
            // Fetch comprehensive data
            const [attendanceRes, employeesRes] = await Promise.all([
                api.get('admin/attendance'),
                api.get('admin/employees')
            ]);

            // Format Employee Data
            const employeesFormatted = employeesRes.data.map(emp => ({
                'Employee ID': emp.employeeId,
                'Name': emp.name,
                'Email': emp.email,
                'Phone': emp.phone,
                'Role': emp.role,
                'Joined Date': new Date(emp.createdAt).toLocaleDateString()
            }));

            // Format Attendance Data
            const attendanceFormatted = attendanceRes.data.map(record => {
                const formatDate = (dateStr) => {
                    if (!dateStr) return 'N/A';
                    const d = new Date(dateStr);
                    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
                };
                const formatTime = (timeStr) => {
                    if (!timeStr) return 'N/A';
                    const d = new Date(timeStr);
                    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString();
                };

                return {
                    'Date': formatDate(record.date),
                    'Employee Name': record.employee?.name || 'Unknown',
                    'Status': record.status,
                    'Check In': formatTime(record.checkIn),
                    'Check Out': formatTime(record.checkOut),
                    'Location': record.location?.address || 'Unknown'
                };
            });

            // Create separate CSVs and download them
            const downloadCSV = (csvStr, filename) => {
                const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            const employeeHeaders = ['Employee ID', 'Name', 'Email', 'Phone', 'Role', 'Joined Date'];
            downloadCSV(convertToCSV(employeesFormatted, employeeHeaders), `employees_audit_${new Date().toISOString().split('T')[0]}.csv`);

            // Slight delay so browser doesn't block multiple downloads
            setTimeout(() => {
                const attendanceHeaders = ['Date', 'Employee Name', 'Status', 'Check In', 'Check Out', 'Location'];
                downloadCSV(convertToCSV(attendanceFormatted, attendanceHeaders), `attendance_audit_${new Date().toISOString().split('T')[0]}.csv`);
            }, 500);

        } catch (error) {
            console.error('Audit export failed:', error);
            alert('Failed to generate audit logs. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div ref={containerRef} className="space-y-10 pb-20 min-h-screen bg-[#0F172A] px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 stagger-item opacity-0 pt-10">
                <div>
                    <h1 className="text-4xl font-display font-black text-white tracking-tight leading-none uppercase">Global<span className="text-indigo-500 italic">.Control</span></h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Enterprise Infrastructure Oversight</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#0F172A] bg-[#1E293B] overflow-hidden shadow-md flex items-center justify-center" title="Active Monitoring Node">
                                <div className="text-[10px] font-black text-slate-500 uppercase leading-none">U{i}</div>
                            </div>
                        ))}
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={handleSystemAudit}
                            disabled={isExporting}
                            className={`px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            <span>{isExporting ? 'Compiling...' : 'System Audit'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <WavyStatCard title="Active Personnel" value={stats.totalEmployees || 0} icon={Users} percentage={12} trend="up" color="indigo" />
                <WavyStatCard title="Today's Check-ins" value={stats.todayAttendance || 0} icon={ShieldCheck} percentage={4} trend="up" color="emerald" />
                <WavyStatCard title="Active Field Tasks" value={stats.todayReports || 0} icon={Zap} percentage={28} trend="up" color="purple" />
                <WavyStatCard title="Pending Verifications" value={stats.pendingLeaves || 0} icon={Briefcase} percentage={2} trend="down" color="indigo" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Analytics Hub */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="card-premium p-10 overflow-hidden relative shadow-lg">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-display font-black text-white tracking-tight">Personnel Performance Matrix</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Historical Verification Cycles</p>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <Activity className="text-indigo-400" size={16} />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Live Telemetry</span>
                            </div>
                        </div>
                        <div className="h-[400px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: '00:00', v: 30 },
                                    { name: '04:00', v: 25 },
                                    { name: '08:00', v: 85 },
                                    { name: '12:00', v: 65 },
                                    { name: '16:00', v: 95 },
                                    { name: '20:00', v: 55 },
                                    { name: '23:59', v: 45 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.25rem', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', color: '#f1f5f9' }} />
                                    <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#0f172a' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card-premium flex flex-col overflow-hidden shadow-lg mt-10">
                        <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none uppercase">Operation <span className="text-indigo-500 italic">Stream</span></h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Real-time Personnel Vectors</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="px-6 py-2.5 bg-white/5 text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                            >
                                Global History
                            </button>
                        </div>
                        <div className="divide-y divide-white/5 px-6 pb-6">
                            <ActivityItem name="Ana Woods" action="Personnel Sync Completed" time="15m ago" status="Secure" onClick={() => navigate('/admin/employees')} />
                            <ActivityItem name="Hannah Wright" action="Encrypted Report Transmitted" time="1h ago" status="Pending" onClick={() => navigate('/admin/reports')} />
                            <ActivityItem name="Mark Stevens" action="Authorization Protocol Initiated" time="3h ago" status="Alert" onClick={() => navigate('/admin/leaves')} />
                        </div>
                    </div>
                </div>

                {/* Auxiliary Matrix Stats */}
                <div className="lg:col-span-4 space-y-10">
                    <GaugeCard title="Global Completion Rate" value={tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 78} color="indigo" />

                    <div className="card-premium p-10 shadow-lg">
                        <h3 className="text-lg font-display font-black text-white tracking-tight leading-none uppercase mb-10">System Health</h3>
                        <div className="space-y-10 flex-1">
                            {[
                                { label: 'Security Protocols', val: 94, color: 'bg-indigo-600' },
                                { label: 'Cloud Sync Status', val: 82, color: 'bg-emerald-500' },
                                { label: 'Database Integrity', val: 99, color: 'bg-indigo-600' },
                                { label: 'Personnel Response', val: 76, color: 'bg-orange-500' }
                            ].map((item, i) => (
                                <HealthBar key={i} label={item.label} percentage={item.val} color={item.color} />
                            ))}
                        </div>
                    </div>

                    <div className="card-premium p-10 stagger-item opacity-0 shadow-lg">
                        <TaskStatusChart tasks={tasks} />
                    </div>

                    <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-lg relative group overflow-hidden cursor-pointer" onClick={() => navigate('/admin/announcements')}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110">
                            <Megaphone size={100} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-black text-white mb-2 leading-none uppercase">Broadcast<span className="text-indigo-500 italic">.Hub</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Global Communication Protocol</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-6 py-3 rounded-2xl inline-flex shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                            Engage Transmission <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityItem = ({ name, action, time, status, onClick }) => (
    <div onClick={onClick} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 mt-2">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-slate-500 uppercase border border-white/5 shadow-sm transition-transform group-hover:scale-105">
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-[13px] font-black text-white leading-tight">{name}</p>
                <p className="text-[10px] font-black text-slate-500 mt-1 flex items-center gap-2 uppercase tracking-wide">
                    {action} <span className="w-1 h-1 rounded-full bg-slate-700" /> {time}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border shadow-sm ${status === 'Secure' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'Alert' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                {status}
            </div>
            <div className="p-2 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                <ChevronRight size={18} />
            </div>
        </div>
    </div>
);

const HealthBar = ({ label, percentage, color }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-sm font-black text-white tabular-nums leading-none tracking-tighter">{percentage}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px] shadow-inner">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full ${color} rounded-full relative overflow-hidden`}
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
        </div>
    </div>
);

const WavyStatCard = ({ title, value, icon: Icon, percentage, trend, color }) => {
    const isPositive = trend === 'up';
    const chartColor = color === 'emerald' ? '#10b981' : color === 'indigo' ? '#6366f1' : '#f59e0b';
    const chartData = [
        { v: 40 }, { v: 30 }, { v: 65 }, { v: 45 }, { v: 90 }, { v: 70 }
    ];

    return (
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] group relative overflow-hidden shadow-2xl transition-all hover:scale-[1.01]">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color === 'emerald' ? 'from-emerald-500/10' : color === 'indigo' ? 'from-indigo-500/10' : 'from-orange-500/10'} to-transparent rounded-bl-full -mr-16 -mt-16 opacity-30 group-hover:opacity-100 transition-all duration-700`} />

            <div className="flex justify-between items-start relative z-10 mb-8">
                <div className={`p-4 rounded-2xl ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'} border border-white/5 shadow-sm transition-transform group-hover:-translate-y-1`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {percentage}%
                </div>
            </div>

            <div className="relative z-10 space-y-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-display">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-black text-white tracking-tighter tabular-nums">{value}</span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-40 transition-opacity duration-700 pointer-events-none px-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={chartColor} strokeWidth={3} fill={`url(#grad-${title})`} isAnimationActive={true} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const GaugeCard = ({ title, value, color }) => {
    const data = [{ v: value }, { v: 100 - value }];
    const COLORS = [color === 'emerald' ? '#10b981' : '#6366f1', '#1e293b'];

    return (
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-white/5 p-10 flex flex-col items-center justify-center relative rounded-[2.5rem] group shadow-2xl transition-all hover:scale-[1.01]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">{title}</h3>
            <div className="relative w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={0} dataKey="v" startAngle={220} endAngle={-40} stroke="none">
                            {data.map((_, index) => (
                                <Cell key={`c-${index}`} fill={COLORS[index]} cornerRadius={index === 0 ? 15 : 0} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
                    <span className="text-5xl font-display font-black text-white tracking-tighter tabular-nums">{value}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] -mt-1">% Global</span>
                </div>
            </div>
            <div className={`mt-6 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'} border shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-3 group-hover:translate-y-0`}>
                Optimization Active
            </div>
        </div>
    );
};

export default AdminDashboard;
