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
        <div ref={containerRef} className="space-y-10 pb-20 min-h-screen px-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 stagger-item opacity-0 pt-10">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">Global<span className="text-sky-500 italic">.Control</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Enterprise Infrastructure Oversight</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-sky-50 overflow-hidden shadow-md flex items-center justify-center" title="Active Monitoring Node">
                                <div className="text-[10px] font-black text-sky-400 uppercase leading-none">U{i}</div>
                            </div>
                        ))}
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={handleSystemAudit}
                            disabled={isExporting}
                            className={`px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-sky-300/40 hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 rounded-full border-2 border-sky-200 border-t-white animate-spin" />
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
                <WavyStatCard title="Active Personnel" value={stats.totalEmployees || 0} icon={Users} percentage={12} trend="up" color="sky" />
                <WavyStatCard title="Today's Check-ins" value={stats.todayAttendance || 0} icon={ShieldCheck} percentage={4} trend="up" color="emerald" />
                <WavyStatCard title="Active Field Tasks" value={stats.todayReports || 0} icon={Zap} percentage={28} trend="up" color="purple" />
                <WavyStatCard title="Pending Verifications" value={stats.pendingLeaves || 0} icon={Briefcase} percentage={2} trend="down" color="sky" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Analytics Hub */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="card-premium p-10 overflow-hidden relative shadow-lg">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight">Personnel Performance Matrix</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Historical Verification Cycles</p>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-sky-50 rounded-2xl border border-sky-200">
                                <Activity className="text-sky-500" size={16} />
                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">Live Telemetry</span>
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
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '1.25rem', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(14,165,233,0.1)', color: '#0f172a' }} />
                                    <Area type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 3, stroke: '#ffffff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card-premium flex flex-col overflow-hidden shadow-lg mt-10">
                        <div className="p-10 border-b border-sky-50 bg-sky-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">Operation <span className="text-sky-500 italic">Stream</span></h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Real-time Personnel Vectors</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="px-6 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-sky-200 hover:bg-sky-100 transition-all shadow-sm"
                            >
                                Global History
                            </button>
                        </div>
                        <div className="divide-y divide-sky-50 px-6 pb-6">
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
                        <h3 className="text-lg font-display font-black text-slate-800 tracking-tight leading-none uppercase mb-10">System Health</h3>
                        <div className="space-y-10 flex-1">
                            {[
                                { label: 'Security Protocols', val: 94, color: 'bg-sky-500' },
                                { label: 'Cloud Sync Status', val: 82, color: 'bg-emerald-500' },
                                { label: 'Database Integrity', val: 99, color: 'bg-sky-500' },
                                { label: 'Personnel Response', val: 76, color: 'bg-orange-500' }
                            ].map((item, i) => (
                                <HealthBar key={i} label={item.label} percentage={item.val} color={item.color} />
                            ))}
                        </div>
                    </div>

                    <div className="card-premium p-10 stagger-item opacity-0 shadow-lg">
                        <TaskStatusChart tasks={tasks} />
                    </div>

                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-10 rounded-[2.5rem] shadow-xl shadow-sky-200/50 relative group overflow-hidden cursor-pointer" onClick={() => navigate('/admin/announcements')}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110">
                            <Megaphone size={100} className="text-slate-800" />
                        </div>
                        <h2 className="text-2xl font-display font-black text-slate-800 mb-2 leading-none uppercase">Broadcast<span className="text-sky-200 italic">.Hub</span></h2>
                        <p className="text-sky-100 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Global Communication Protocol</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-white px-6 py-3 rounded-2xl inline-flex shadow-xl active:scale-95 transition-all">
                            Engage Transmission <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityItem = ({ name, action, time, status, onClick }) => (
    <div onClick={onClick} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-sky-50 rounded-2xl transition-all border border-transparent hover:border-sky-100 mt-2">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-xs font-black text-slate-800 uppercase shadow-md shadow-sky-200/50 transition-transform group-hover:scale-105">
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-[13px] font-black text-slate-800 leading-tight">{name}</p>
                <p className="text-[10px] font-black text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-wide">
                    {action} <span className="w-1 h-1 rounded-full bg-slate-300" /> {time}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border shadow-sm ${status === 'Secure' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : status === 'Alert' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-orange-50 text-orange-500 border-orange-200'}`}>
                {status}
            </div>
            <div className="p-2 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all">
                <ChevronRight size={18} />
            </div>
        </div>
    </div>
);

const HealthBar = ({ label, percentage, color }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-sm font-black text-slate-800 tabular-nums leading-none tracking-tighter">{percentage}%</span>
        </div>
        <div className="h-2.5 bg-sky-50 rounded-full overflow-hidden border border-sky-100 p-[2px] shadow-inner">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full ${color} rounded-full relative overflow-hidden`}
            >
                <div className="absolute inset-0 bg-white/25 animate-pulse" />
            </motion.div>
        </div>
    </div>
);

const WavyStatCard = ({ title, value, icon: Icon, percentage, trend, color }) => {
    const isPositive = trend === 'up';
    const chartColor = color === 'emerald' ? '#10b981' : color === 'sky' ? '#0ea5e9' : '#0ea5e9';
    const bgGrad = color === 'emerald'
        ? 'from-emerald-50 to-teal-50 border-emerald-100'
        : color === 'purple'
            ? 'from-violet-50 to-purple-50 border-violet-100'
            : 'from-sky-50 to-blue-50 border-sky-100';
    const iconColor = color === 'emerald'
        ? 'bg-emerald-100 text-emerald-600'
        : color === 'purple'
            ? 'bg-violet-100 text-violet-600'
            : 'bg-sky-100 text-sky-600';
    const chartData = [
        { v: 40 }, { v: 30 }, { v: 65 }, { v: 45 }, { v: 90 }, { v: 70 }
    ];

    return (
        <div className={`bg-gradient-to-br ${bgGrad} border p-8 rounded-[2rem] group relative overflow-hidden shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex justify-between items-start relative z-10 mb-8">
                <div className={`p-4 rounded-2xl ${iconColor} shadow-sm transition-transform group-hover:-translate-y-1`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${isPositive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'} border`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {percentage}%
                </div>
            </div>

            <div className="relative z-10 space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-display">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-black text-slate-800 tracking-tighter tabular-nums">{value}</span>
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
    const COLORS = [color === 'emerald' ? '#10b981' : '#0ea5e9', '#e0f2fe'];

    return (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-10 flex flex-col items-center justify-center relative rounded-[2.5rem] group shadow-sm transition-all hover:scale-[1.02]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">{title}</h3>
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
                    <span className="text-5xl font-display font-black text-slate-800 tracking-tighter tabular-nums">{value}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] -mt-1">% Global</span>
                </div>
            </div>
            <div className={`mt-6 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-sky-100 text-sky-700 border border-sky-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-3 group-hover:translate-y-0`}>
                Optimization Active
            </div>
        </div>
    );
};

export default AdminDashboard;


