import { useState, useEffect, useRef } from 'react';
import {
    Users, CalendarCheck, FileText,
    AlertCircle, TrendingUp, Clock,
    Search, Download, ChevronRight,
    Activity, Megaphone, CheckCircle2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TaskStatusChart from '../../components/TaskStatusChart';

gsap.registerPlugin(useGSAP);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        avgRating: '0.0',
        avgTaskCompletion: 0,
        avgAttendanceScore: 0,
        avgTeamworkScore: 0,
        totalEmployees: 0
    });
    const [tasks, setTasks] = useState([]);
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
                // Fetch stats (can reuse admin stats endpoint if they apply, or we assume a manager has team view)
                // For now, we will fetch global tasks to populate the chart
                const [statsRes, tasksRes] = await Promise.all([
                    api.get('admin/manager-stats'),
                    api.get('tasks') // Or an endpoint that gets tasks for the manager's team
                ]);
                setStats(statsRes.data);

                // Tasks might come back wrapped if it's an admin endpoint, handle accordingly
                // Assuming `/api/tasks` gets tasks relevant to the current user context
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Error fetching manager dashboard data:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div ref={containerRef} className="space-y-10 pb-20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 stagger-item opacity-0">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">Team<span className="text-blue-500 italic">.Control</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Managerial Oversight Panel</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="btn-primary px-6 py-3 flex items-center gap-3 transition-opacity"
                    >
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Review Tasks
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="stat-card opacity-0"><ManagerStat label="Task Completion" value={`${stats.avgTaskCompletion}%`} icon={<CheckCircle2 size={20} />} color="text-indigo-500" bgColor="bg-indigo-50" onClick={() => navigate('/admin/tasks')} /></div>
                <div className="stat-card opacity-0"><ManagerStat label="Attendance Score" value={`${stats.avgAttendanceScore}%`} icon={<CalendarCheck size={20} />} color="text-emerald-500" bgColor="bg-emerald-50" onClick={() => navigate('/admin/attendance-hub')} /></div>
                <div className="stat-card opacity-0"><ManagerStat label="Teamwork Score" value={`${stats.avgTeamworkScore}%`} icon={<Users size={20} />} color="text-orange-500" bgColor="bg-orange-50" onClick={() => navigate('/admin/performance')} /></div>
                <div className="stat-card opacity-0"><ManagerStat label="Average Merit Rating" value={stats.avgRating} icon={<TrendingUp size={20} />} color="text-blue-500" bgColor="bg-blue-50" onClick={() => navigate('/admin/performance')} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Task Chart Col */}
                <div className="lg:col-span-5 h-full stagger-item opacity-0">
                    {/* The new reusable chart component */}
                    <TaskStatusChart tasks={tasks} />
                </div>

                <div className="lg:col-span-7 card-premium flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm stagger-item opacity-0">
                    <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h2 className="font-display font-black text-slate-800 tracking-tight">Team <span className="text-blue-500">Activity</span></h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent Actions</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <ActivityItem name="Ana Woods" action="Completed site inspection" time="15m ago" status="Secure" onClick={() => navigate('/admin/employees')} />
                        <ActivityItem name="Hannah Wright" action="Submitted leave request" time="1h ago" status="Pending" onClick={() => navigate('/admin/leaves')} />
                        <ActivityItem name="Mark Stevens" action="Started Installation Task" time="3h ago" status="Active" onClick={() => navigate('/admin/tasks')} />
                        <ActivityItem name="Sarah Jenkins" action="Uploaded field report" time="5h ago" status="Secure" onClick={() => navigate('/admin/reports')} />
                    </div>
                </div>

            </div>
        </div>
    );
};

const ManagerStat = ({ label, value, icon, color, bgColor, onClick }) => (
    <div onClick={onClick} className={`card-premium p-8 group hover:scale-[1.02] transition-all relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform">
            {icon}
        </div>
        <div className="flex items-center justify-between mb-8">
            <div className={`p-4 rounded-[1.25rem] ${bgColor} ${color} shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 cursor-pointer transition-colors">
                <ChevronRight size={16} />
            </div>
        </div>
        <div>
            <p className="text-3xl font-display font-black text-slate-800 tracking-tighter tabular-nums leading-none mb-2 group-hover:text-blue-500 transition-colors duration-300">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</p>
        </div>
    </div>
);

const ActivityItem = ({ name, action, time, status, onClick }) => {
    let statusClass = 'bg-slate-50 text-slate-500 border-slate-100';
    if (status === 'Secure') statusClass = 'bg-emerald-50 text-emerald-500 border-emerald-100';
    if (status === 'Active') statusClass = 'bg-blue-50 text-blue-500 border-blue-100';
    if (status === 'Pending') statusClass = 'bg-orange-50 text-orange-500 border-orange-100';

    return (
        <div onClick={onClick} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-white/80 transition-all border-l-4 border-transparent hover:border-blue-500">
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
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClass}`}>
                    {status}
                </div>
                <div className="p-2 text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={18} />
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
