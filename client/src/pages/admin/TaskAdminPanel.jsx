import { useEffect, useState, useRef } from 'react';
import { Users, Activity, CheckCircle, TrendingUp, Search, Plus, Filter, MoreVertical, ShieldCheck, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const AdminTaskPanel = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [notification, setNotification] = useState('');

    // New Dispatch Form State
    const [newTask, setNewTask] = useState({
        assignedTo: '',
        clientName: '',
        location: '',
        taskType: 'Installation',
        priority: 'Normal',
        dueDate: new Date().toISOString().split('T')[0] // Default to today
    });

    useEffect(() => {
        fetchTasks();
        fetchEmployees();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            toast.error('Failed to load tasks');
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('admin/employees');
            setEmployees(res.data);
            // Pre-select first employee or clear if none
            setNewTask(prev => ({ ...prev, assignedTo: res.data.length > 0 ? res.data[0]._id : '' }));
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const handleAssignTask = async () => {
        if (!newTask.assignedTo || !newTask.clientName || !newTask.location) {
            return toast.error('Please fill in all required fields');
        }

        try {
            await api.post('tasks', newTask);
            showNotification('Task Successfully Assigned!');
            setShowDispatchModal(false);
            setNewTask({ ...newTask, clientName: '', location: '' });
            fetchTasks(); // Refresh list
        } catch (err) {
            console.error('Error assigning task:', err);
            toast.error('Failed to assign task');
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleApprove = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/tasks/${id}/status`, { status: 'Completed' });
            showNotification(`Task has been approved and moved to completed queue.`);
            fetchTasks(); // Refresh
        } catch (err) {
            console.error('Error approving task:', err);
            toast.error('Failed to approve task');
        }
    };

    const handleReview = (approval, e) => {
        if (e) e.stopPropagation();
        setSelectedApproval(approval);
        setShowReviewModal(true);
    };

    // GSAP Animations
    const containerRef = useRef();
    const modalRef = useRef();

    gsap.registerPlugin(useGSAP);

    useGSAP(() => {
        // Explicitly use fromTo to prevent React Strict mode glitches where 'from' saves opacity: 0 as the starting base
        if (gsap.utils.toArray('.stat-card').length > 0) {
            gsap.fromTo('.stat-card',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }

        if (gsap.utils.toArray('.stagger-item').length > 0) {
            gsap.fromTo('.stagger-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
            );
        }
    }, { scope: containerRef, dependencies: [tasks, employees] });

    useGSAP(() => {
        if (showDispatchModal && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
            );
        }
    }, [showDispatchModal]);

    return (
        <div ref={containerRef} className="space-y-8 pb-20 bg-sky-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-sky-50 p-8 rounded-[2rem] shadow-2xl border border-sky-100">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-slate-800 mb-2 uppercase">
                        Command<span className="text-sky-500">.Center</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400 max-w-xl italic">
                        Monitor field employee dispatch, approve completed tasks, and track operational metrics in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            fetchEmployees();
                            setShowDispatchModal(true);
                        }}
                        className="bg-sky-500 hover:bg-sky-700 text-slate-800 px-8 py-4 rounded-2xl shadow-xl shadow-sky-600/20 transition-all font-bold active:scale-95 flex items-center gap-3"
                    >
                        <Plus size={20} />
                        <span>Assign Task</span>
                    </button>
                    <button
                        onClick={() => {
                            const url = localStorage.getItem('cxUrl');
                            if (!url || url === "https://cx.google.com") {
                                return showNotification('Go to System Settings > Portal Config to set the Cx Platform URL');
                            }
                            window.open(url, "_blank", "noreferrer");
                        }}
                        className="px-6 py-4 rounded-2xl bg-sky-50 border border-sky-100 text-slate-300 font-bold text-sm shadow-xl hover:bg-sky-100 transition-all flex items-center gap-3"
                    >
                        <Activity size={20} className="text-sky-500" />
                        <span>Cx Platform</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
                <StatCard className="stat-card" title="Active Field Employees" value={employees.length || "0"} trend="Active" icon={<Users className="text-sky-500" />} linkTo="/admin/live-tracker" />
                <StatCard className="stat-card" title="Tasks In Progress" value={tasks.filter(t => t.status === 'In Progress').length || "0"} trend="Live" icon={<Activity className="text-rose-400" />} linkTo="/admin/tasks" />
                <StatCard className="stat-card" title="Tasks Completed" value={tasks.filter(t => t.status === 'Completed').length || "0"} trend="Done" icon={<CheckCircle className="text-emerald-400" />} linkTo="/admin/reports" />
                <StatCard className="stat-card" title="Awaiting Approval" value={tasks.filter(t => t.status === 'Awaiting Approval').length || "0"} trend="Pending" icon={<TrendingUp className="text-amber-400" />} linkTo="/admin/tasks" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-2">
                {/* Main Table Area */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Active Tasks List */}
                    <div className="card-premium p-8 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase">Active Tasks</h3>
                                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Click any task to view details or chat</p>
                            </div>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {employees.map(emp => {
                                const activeTasks = tasks.filter(t =>
                                    t.assignedTo?._id === emp._id &&
                                    (t.status === 'In Progress' || t.status === 'Pending')
                                );

                                if (activeTasks.length === 0) return null;

                                return (
                                    <div key={emp._id} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4 sticky top-0 bg-sky-500 backdrop-blur-md py-4 z-10 px-6 rounded-[1.5rem] shadow-lg border border-sky-400/30">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                                            <span className="text-[12px] font-black text-white uppercase tracking-[0.25em]">{emp.name}'s Queue</span>
                                        </div>
                                        {activeTasks.map(task => (
                                            <div
                                                key={task._id}
                                                onClick={() => handleReview(task)}
                                                className="stagger-item p-6 bg-white/60 backdrop-blur-sm border border-sky-100 shadow-sm hover:shadow-xl rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all hover:bg-white group"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-base font-black text-slate-800 uppercase group-hover:text-sky-500 transition-colors">{task.clientName}</h4>
                                                        {task.assignedBy?._id === task.assignedTo?._id && (
                                                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 text-[9px] font-black uppercase tracking-widest border border-sky-500/20">Self-Task</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="px-2.5 py-1 bg-sky-500/5 text-sky-600 text-[10px] font-black rounded-lg border border-sky-500/10 uppercase tracking-wider">{task.taskType}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none drop-shadow-sm">{task.location}</span>
                                                    </div>
                                                    {task.startLocation && (
                                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-2 bg-emerald-500/10 w-max px-2 py-1 rounded-md border border-emerald-500/20">
                                                            <MapPin size={10} /> Live GPS Tracked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] self-start sm:self-auto shadow-sm border ${task.status === 'In Progress' ? 'bg-sky-500 text-white border-sky-400 font-black' : 'bg-slate-50 text-slate-400 border-slate-100 font-bold'}`}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}

                            {tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-8">No active tasks at the moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Task Assignment Table */}
                    <div className="card-premium p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase">Employee Roster & Assignments</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input type="text" placeholder="Search Employee..." className="pl-9 pr-4 py-2 bg-sky-50/50 text-xs text-slate-800 rounded-xl border border-sky-100 outline-none focus:border-sky-500 focus:bg-sky-50 transition-all placeholder:text-slate-500" />
                                </div>
                                <button className="p-2 bg-sky-50 border border-sky-100 text-slate-400 rounded-xl hover:text-sky-500 transition-colors">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-sky-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                        <th className="py-4 pl-4">Employee details</th>
                                        <th className="py-4">Expertise</th>
                                        <th className="py-4">Status</th>
                                        <th className="py-4">Active Tasks</th>
                                        <th className="py-4 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(agent => {
                                        const activeCount = tasks.filter(t => t.assignedTo?._id === agent._id && t.status !== 'Completed').length;
                                        return (
                                            <tr key={agent._id} className="border-b border-sky-100 hover:bg-sky-50 transition-colors group">
                                                <td className="py-4 pl-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-xs font-bold text-sky-500 border border-sky-500/20">
                                                            {(agent.name || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-sky-500 transition-colors uppercase">{agent.name}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black">{agent.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(agent.expertise || []).map(exp => (
                                                            <span key={exp} className="px-1.5 py-0.5 rounded-md bg-sky-50 text-slate-400 text-[9px] font-bold uppercase border border-sky-100">{exp}</span>
                                                        ))}
                                                        {(!agent.expertise || agent.expertise.length === 0) && <span className="text-[9px] text-slate-500 font-bold italic">Unassigned</span>}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="py-4 text-slate-400 font-bold text-sm tabular-nums">{activeCount}</td>
                                                <td className="py-4 text-right pr-4 text-slate-400 relative">
                                                    <button
                                                        onClick={() => setActionMenuOpen(actionMenuOpen === agent._id ? null : agent._id)}
                                                        className="p-1 hover:text-sky-500 transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {actionMenuOpen === agent._id && (
                                                        <div className="absolute right-8 top-8 w-36 bg-white rounded-xl shadow-2xl border border-sky-100 z-[100] py-2">
                                                            <button
                                                                onClick={() => { showNotification(`Opened details for ${agent.name}`); setActionMenuOpen(null); }}
                                                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                                                            >View Details</button>
                                                            <button
                                                                onClick={() => { showNotification(`Reassigning route for ${agent.name}`); setActionMenuOpen(null); }}
                                                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                                                            >Reassign Route</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Approvals */}
                <div className="space-y-6">
                    <div className="card-premium p-6 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800 uppercase">Awaiting Approval</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{tasks.filter(t => t.status === 'Awaiting Approval').length} Tasks Pending</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {tasks.filter(t => t.status === 'Awaiting Approval').map(approval => (
                                <div
                                    key={approval._id}
                                    onClick={() => handleReview(approval)}
                                    className="p-4 rounded-2xl bg-sky-50 border border-sky-100 hover:border-sky-500/30 shadow-sm transition-all relative overflow-hidden group cursor-pointer"
                                    title="Click to Review Task"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{approval.taskId}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg">{approval.timeElapsed || 0}m log</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase mb-1 group-hover:text-sky-500 transition-colors">{approval.clientName}</h4>
                                    <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tight mb-4">
                                        {approval.taskType} • {approval.assignedTo?.name}
                                        {approval.assignedBy?._id === approval.assignedTo?._id && (
                                            <span className="ml-2 text-[9px] text-sky-500 font-black tracking-tighter">[SELF]</span>
                                        )}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleApprove(approval._id, e)}
                                            className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-slate-800 transition-all shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={(e) => handleReview(approval, e)}
                                            className="flex-1 py-2 bg-sky-50 text-slate-400 border border-sky-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/10 hover:text-sky-500 transition-all shadow-sm"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {tasks.filter(t => t.status === 'Awaiting Approval').length === 0 && (
                                <div className="py-20 text-center">
                                    <ShieldCheck size={32} className="mx-auto text-slate-800 mb-3" />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dispatch Modal Redesign */}
            {showDispatchModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                    <div ref={modalRef} className="bg-white rounded-[2.5rem] shadow-2xl border border-sky-100 w-full max-w-lg overflow-hidden relative">
                        {/* Decorative background blur */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

                        <div className="px-8 mt-8 mb-2 flex justify-between items-start relative z-10">
                            <div>
                                <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Assign Task</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Deploy Field Personnel</p>
                            </div>
                            <button
                                onClick={() => setShowDispatchModal(false)}
                                className="w-10 h-10 bg-sky-50 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl flex items-center justify-center transition-all border border-sky-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Task Category</label>
                                <select
                                    className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all appearance-none cursor-pointer"
                                    value={newTask.taskType}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        setNewTask({ ...newTask, taskType: type });
                                        const eligible = employees.filter(emp =>
                                            emp.expertise && emp.expertise.some(exp =>
                                                exp === type || (type === 'Service' && exp === 'Maintenance') || (type === 'Repair' && exp === 'Service')
                                            )
                                        );
                                        if (eligible.length > 0 && !eligible.find(e => e._id === newTask.assignedTo)) {
                                            setNewTask(prev => ({ ...prev, assignedTo: eligible[0]._id }));
                                        }
                                    }}
                                >
                                    <option value="Installation">Installation</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Inspection">Inspection</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Assignee</label>
                                <select
                                    className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all appearance-none cursor-pointer"
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="" disabled>Select Personnel...</option>
                                    {/* Matched employees at the top */}
                                    {employees
                                        .filter(emp => emp.expertise?.some(exp =>
                                            exp === newTask.taskType || (newTask.taskType === 'Repair' && exp === 'Service')
                                        ))
                                        .map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name || emp.email?.split('@')[0] || 'Unknown'} - RECOMMENDED
                                            </option>
                                        ))
                                    }
                                    {/* All other employees */}
                                    {employees
                                        .filter(emp => !emp.expertise?.some(exp =>
                                            exp === newTask.taskType || (newTask.taskType === 'Repair' && exp === 'Service')
                                        ))
                                        .map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                • {emp.name || emp.email?.split('@')[0] || 'Unknown'}
                                                {emp.expertise?.length > 0 ? ` [${emp.expertise.join(', ')}]` : ' [No set expertise]'}
                                            </option>
                                        ))
                                    }
                                    {employees.length === 0 && (
                                        <option disabled>-- No employees available in system --</option>
                                    )}
                                </select>
                                {employees.filter(emp => emp.expertise?.some(exp =>
                                    exp === newTask.taskType || (newTask.taskType === 'Repair' && exp === 'Service')
                                )).length === 0 && employees.length > 0 && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-2 ml-1 flex items-center gap-1">
                                            <ShieldCheck size={12} /> No exact matches — assigning to general pool
                                        </p>
                                    )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Client</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. City Bank Main"
                                        className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all placeholder:text-slate-500 placeholder:font-bold placeholder:uppercase placeholder:text-[10px]"
                                        value={newTask.clientName}
                                        onChange={(e) => setNewTask({ ...newTask, clientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deployment Zone</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Westside Avenue"
                                        className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all placeholder:text-slate-500 placeholder:font-bold placeholder:uppercase placeholder:text-[10px]"
                                        value={newTask.location}
                                        onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Priority Level</label>
                                    <select
                                        className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all appearance-none cursor-pointer"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Normal">Routine (Normal)</option>
                                        <option value="High">Priority (High)</option>
                                        <option value="Urgent">Critical (Urgent)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deadline Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/5 transition-all"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-sky-50 p-6 flex items-center gap-3 border-t border-sky-100">
                            <button
                                onClick={() => setShowDispatchModal(false)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 hover:text-slate-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignTask}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 bg-sky-500 rounded-xl shadow-xl shadow-sky-600/20 hover:bg-sky-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                Deploy Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReviewModal && selectedApproval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-sky-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                            {selectedApproval.status === 'Awaiting Approval' ? 'Review Task Log' : 'Task Details & Chat'}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">Task ID: {selectedApproval.taskId} • {selectedApproval.clientName}</p>

                        <div className="space-y-4">
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Assigned Employee</p>
                                <p className="text-sm font-black text-slate-800 uppercase">
                                    {selectedApproval.assignedTo?.name}
                                    {selectedApproval.assignedBy?._id === selectedApproval.assignedTo?._id && (
                                        <span className="ml-2 px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[9px] font-black uppercase">Self-Tasked</span>
                                    )}
                                </p>
                            </div>
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Task Type</p>
                                <p className="text-sm font-black text-slate-800 uppercase">{selectedApproval.taskType}</p>
                            </div>
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Time Logged</p>
                                <p className="text-sm font-black text-slate-800 uppercase tabular-nums">{selectedApproval.timeElapsed || 0} mins</p>
                            </div>
                            {selectedApproval.notes && (
                                <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Employee Notes</p>
                                    <p className="text-xs font-bold text-slate-400 italic">"{selectedApproval.notes}"</p>
                                </div>
                            )}

                            {selectedApproval.startLocation && (
                                <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-sky-500 mb-1 uppercase tracking-widest">GPS Capture Activity</p>
                                        <p className="text-[10px] text-sky-500/70 font-bold">Captured: {selectedApproval.startLocation.lat.toFixed(4)}, {selectedApproval.startLocation.lng.toFixed(4)}</p>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${selectedApproval.startLocation.lat},${selectedApproval.startLocation.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-sky-500 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-600/20"
                                    >
                                        <MapPin size={12} />
                                        View Map
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 text-[10px] font-black text-slate-400 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all border border-sky-100 uppercase tracking-widest">Close</button>
                            {selectedApproval.status === 'Awaiting Approval' && (
                                <button onClick={() => { handleApprove(selectedApproval._id); setShowReviewModal(false); }} className="flex-1 py-3 text-[10px] font-black text-slate-800 bg-sky-500 hover:bg-sky-700 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-sky-600/20">Approve</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Notification Toast */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border border-sky-100 text-slate-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[200] font-black text-[10px] tracking-widest uppercase">
                    <CheckCircle size={18} className="text-emerald-400" />
                    {notification}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, linkTo }) => {
    const CardContent = (
        <div className="card-premium p-6 relative overflow-hidden group h-full transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-[0.1] group-hover:opacity-[0.2] group-hover:scale-110 transition-all duration-700">
                {icon}
            </div>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2 relative z-10">{title}</p>
            <div className="flex items-end gap-3 relative z-10">
                <h4 className="text-3xl font-display font-black text-slate-800 tabular-nums">{value}</h4>
                <span className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-widest">{trend}</span>
            </div>
        </div>
    );

    return linkTo ? <Link to={linkTo} className="block h-full cursor-pointer">{CardContent}</Link> : CardContent;
};

export default AdminTaskPanel;


