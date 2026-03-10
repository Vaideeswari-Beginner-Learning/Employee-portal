import { useState, useEffect, useRef } from 'react';
import {
    Users, CalendarCheck, FileText,
    AlertCircle, TrendingUp, Clock,
    Search, Download, ChevronRight,
    Activity, Megaphone
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
    const [isExporting, setIsExporting] = useState(false);
    const containerRef = useRef();

    useGSAP(() => {
        gsap.fromTo('.stat-card',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
        );

        gsap.fromTo('.stagger-item',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
        );
    }, { scope: containerRef, dependencies: [stats] });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('admin/dashboard-stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
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
        <div ref={containerRef} className="space-y-10 pb-20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 stagger-item opacity-0">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">Global<span className="text-primary-500 italic">.Control</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Enterprise Infrastructure Oversight</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-xl border-4 border-[#f8fafb] bg-slate-200 overflow-hidden shadow-sm" title="Active Monitoring Node">
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">U{i}</div>
                            </div>
                        ))}
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={handleSystemAudit}
                            disabled={isExporting}
                            className={`btn-teal px-6 py-3 flex items-center gap-3 transition-opacity ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            <span className="text-xs font-black uppercase tracking-widest">
                                {isExporting ? 'Compiling...' : 'System Audit'}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="stat-card opacity-0"><AdminStat label="Total Personnel" value={stats.totalEmployees} icon={<Users size={20} />} color="text-primary-500" bgColor="bg-primary-50" onClick={() => navigate('/admin/employees')} /></div>
                <div className="stat-card opacity-0"><AdminStat label="Duty Status" value={`${stats.todayAttendance}%`} icon={<CalendarCheck size={20} />} color="text-emerald-500" bgColor="bg-emerald-50" onClick={() => navigate('/admin/attendance')} /></div>
                <div className="stat-card opacity-0"><AdminStat label="Pending Auth" value={stats.pendingLeaves} icon={<AlertCircle size={20} />} color="text-orange-500" bgColor="bg-orange-50" onClick={() => navigate('/admin/leaves')} /></div>
                <div className="stat-card opacity-0"><AdminStat label="Telemetry In" value={stats.todayReports} icon={<Activity size={20} />} color="text-indigo-500" bgColor="bg-indigo-50" onClick={() => navigate('/admin/reports')} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 card-premium flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm stagger-item opacity-0">
                    <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h2 className="font-display font-black text-slate-800 tracking-tight">Operation <span className="text-primary-500">Stream</span></h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Personnel Vectors</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] px-4 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                            Global History
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <ActivityItem name="Ana Woods" action="Personnel Sync Completed" time="15m ago" status="Secure" onClick={() => navigate('/admin/employees')} />
                        <ActivityItem name="Hannah Wright" action="Encrypted Report Transmitted" time="1h ago" status="Pending" onClick={() => navigate('/admin/reports')} />
                        <ActivityItem name="Mark Stevens" action="Authorization Protocol Initiated" time="3h ago" status="Alert" onClick={() => navigate('/admin/leaves')} />
                        <ActivityItem name="Sarah Jenkins" action="Identity Node Reconfigured" time="5h ago" status="Secure" onClick={() => navigate('/admin/employees')} />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="card-premium p-8 gradient-mesh-bg border-white/40 stagger-item opacity-0">
                        <h2 className="font-display font-black text-slate-800 mb-8 flex items-center gap-3">
                            <TrendingUp size={20} className="text-primary-500" />
                            Infrastructure
                        </h2>
                        <div className="space-y-8">
                            <HealthBar label="Encryption Core" percentage={98} color="bg-emerald-500" />
                            <HealthBar label="Identity Matrix" percentage={100} color="bg-primary-500" />
                            <HealthBar label="Neural Storage" percentage={65} color="bg-orange-500" />
                        </div>
                    </div>

                    <div className="card-premium p-8 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden relative group stagger-item opacity-0">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <AlertCircle size={80} className="text-white" />
                        </div>
                        <h2 className="font-display font-black text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Emergency Alerts
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                                        <AlertCircle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Sync Failure</p>
                                        <p className="text-xs font-medium text-slate-400 leading-relaxed">3 Nodes failed biometric verification protocols today.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg">
                                        <Clock size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Cycle Transition</p>
                                        <p className="text-xs font-medium text-slate-400 leading-relaxed">System Audit window opening in T-Minus 48h.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-8 bg-primary-600 border-primary-500 shadow-xl overflow-hidden relative group cursor-pointer stagger-item opacity-0" onClick={() => navigate('/admin/announcements')}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Megaphone size={60} className="text-white" />
                        </div>
                        <h2 className="font-display font-black text-white mb-2 flex items-center gap-2">
                            Broadcast.Hub
                        </h2>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6">Global Communication Protocol</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg inline-flex">
                            Engage Transmission <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminStat = ({ label, value, icon, color, bgColor, onClick }) => (
    <div onClick={onClick} className={`card-premium p-8 group hover:scale-[1.02] transition-all relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform">
            {icon}
        </div>
        <div className="flex items-center justify-between mb-8">
            <div className={`p-4 rounded-[1.25rem] ${bgColor} ${color} shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:bg-primary-50 cursor-pointer transition-colors">
                <ChevronRight size={16} />
            </div>
        </div>
        <div>
            <p className="text-3xl font-display font-black text-slate-800 tracking-tighter tabular-nums leading-none mb-2 group-hover:text-primary-500 transition-colors duration-300">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</p>
        </div>
    </div>
);

const ActivityItem = ({ name, action, time, status, onClick }) => (
    <div onClick={onClick} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-white/80 transition-all border-l-4 border-transparent hover:border-primary-500">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 flex items-center justify-center text-xs font-black text-slate-400 uppercase border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-black text-slate-800 leading-tight">
                    {name}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-2">
                    {action} <span className="w-1 h-1 rounded-full bg-slate-200" /> {time}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status === 'Secure' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : status === 'Alert' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                {status}
            </div>
            <div className="p-2 text-slate-200 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                <ChevronRight size={18} />
            </div>
        </div>
    </div>
);

const HealthBar = ({ label, percentage, color }) => {
    const barRef = useRef();

    useGSAP(() => {
        gsap.fromTo(barRef.current,
            { width: '0%' },
            { width: `${percentage}%`, duration: 1.5, ease: 'power3.out', delay: 0.5 }
        );
    }, [percentage]);

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black text-slate-800 tabular-nums">{percentage}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 p-[2px]">
                <div
                    ref={barRef}
                    className={`h-full ${color} rounded-md shadow-sm relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
