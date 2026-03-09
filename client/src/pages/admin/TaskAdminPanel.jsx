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
        gsap.fromTo('.stat-card',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
        );

        gsap.fromTo('.stagger-item',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
        );
    }, { scope: containerRef });

    useGSAP(() => {
        if (showDispatchModal && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
            );
        }
    }, [showDispatchModal]);

    return (
        <div ref={containerRef} className="space-y-8 pb-20 bg-slate-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
                        Command Center
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">
                        Monitor field employee dispatch, approve completed tasks, and track operational metrics in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            fetchEmployees(); // Ensure dropdown is synced with latest personnel
                            setShowDispatchModal(true);
                        }}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center gap-3"
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
                        className="px-6 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        <Activity size={20} className="text-indigo-400" />
                        <span>Cx Platform</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
                <StatCard className="stat-card" title="Active Field Employees" value={employees.length || "0"} trend="Active" icon={<Users className="text-indigo-500" />} linkTo="/admin/live-tracker" />
                <StatCard className="stat-card" title="Tasks In Progress" value={tasks.filter(t => t.status === 'In Progress').length || "0"} trend="Live" icon={<Activity className="text-rose-500" />} linkTo="/admin/tasks" />
                <StatCard className="stat-card" title="Tasks Completed" value={tasks.filter(t => t.status === 'Completed').length || "0"} trend="Done" icon={<CheckCircle className="text-emerald-500" />} linkTo="/admin/reports" />
                <StatCard className="stat-card" title="Awaiting Approval" value={tasks.filter(t => t.status === 'Awaiting Approval').length || "0"} trend="Pending" icon={<TrendingUp className="text-amber-500" />} linkTo="/admin/tasks" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-2">
                {/* Main Table Area */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Active Tasks List */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Active Tasks</h3>
                                <p className="text-xs text-slate-500 mt-1">Click any task to view details or chat</p>
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
                                        <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1 z-10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.name}'s Queue</span>
                                        </div>
                                        {activeTasks.map(task => (
                                            <div
                                                key={task._id}
                                                onClick={() => handleReview(task)}
                                                className="stagger-item p-5 bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-[1.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:-translate-y-1 group"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{task.clientName}</h4>
                                                        {task.assignedBy?._id === task.assignedTo?._id && (
                                                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100">Self-Task</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{task.taskType}</span>
                                                        <span>•</span>
                                                        <span>{task.location}</span>
                                                    </p>
                                                    {task.startLocation && (
                                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-2 bg-emerald-50 w-max px-2 py-1 rounded-md">
                                                            <MapPin size={10} /> Live GPS Tracked
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' : 'bg-slate-100 text-slate-500'}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}

                            {tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-8">No active tasks at the moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Task Assignment Table */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900">Employee Roster & Assignments</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input type="text" placeholder="Search Employee..." className="pl-9 pr-4 py-2 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                                </div>
                                <button className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-800 transition-colors">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
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
                                            <tr key={agent._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-4 pl-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                                                            {(agent.name || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{agent.name}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase">{agent.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(agent.expertise || []).map(exp => (
                                                            <span key={exp} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold uppercase">{exp}</span>
                                                        ))}
                                                        {(!agent.expertise || agent.expertise.length === 0) && <span className="text-[9px] text-slate-400 font-bold italic">Unassigned</span>}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="py-4 text-slate-600 font-medium text-sm">{activeCount}</td>
                                                <td className="py-4 text-right pr-4 text-slate-400 relative">
                                                    <button
                                                        onClick={() => setActionMenuOpen(actionMenuOpen === agent._id ? null : agent._id)}
                                                        className="p-1 hover:text-slate-800 transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {actionMenuOpen === agent._id && (
                                                        <div className="absolute right-8 top-8 w-32 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-2">
                                                            <button
                                                                onClick={() => { showNotification(`Opened details for ${agent.name}`); setActionMenuOpen(null); }}
                                                                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                                            >View Details</button>
                                                            <button
                                                                onClick={() => { showNotification(`Reassigning route for ${agent.name}`); setActionMenuOpen(null); }}
                                                                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Awaiting Approval</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{tasks.filter(t => t.status === 'Awaiting Approval').length} Tasks Pending</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {tasks.filter(t => t.status === 'Awaiting Approval').map(approval => (
                                <div
                                    key={approval._id}
                                    onClick={() => handleReview(approval)}
                                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all relative overflow-hidden group cursor-pointer"
                                    title="Click to Review Task"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-700">{approval.taskId}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">{approval.timeElapsed || 0}m log</span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{approval.clientName}</h4>
                                    <p className="text-[11px] text-slate-500 mb-4">
                                        {approval.taskType} • By {approval.assignedTo?.name}
                                        {approval.assignedBy?._id === approval.assignedTo?._id && (
                                            <span className="ml-2 text-[9px] text-blue-500 font-black tracking-tighter">[SELF]</span>
                                        )}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleApprove(approval._id, e)}
                                            className="flex-1 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={(e) => handleReview(approval, e)}
                                            className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {tasks.filter(t => t.status === 'Awaiting Approval').length === 0 && (
                                <div className="py-10 text-center">
                                    <ShieldCheck size={32} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium text-sm">All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dispatch Modal Redesign */}
            {showDispatchModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div ref={modalRef} className="bg-white rounded-[2.5rem] shadow-2xl border border-white/20 w-full max-w-lg overflow-hidden relative">
                        {/* Decorative background blur */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />

                        <div className="px-8 mt-8 mb-2 flex justify-between items-start relative z-10">
                            <div>
                                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Assign Task 🚀</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Deploy Field Personnel</p>
                            </div>
                            <button
                                onClick={() => setShowDispatchModal(false)}
                                className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Task Category</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
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
                                    <option value="Installation">🔧 Installation</option>
                                    <option value="Maintenance">🛠️ Maintenance</option>
                                    <option value="Repair">⚡ Repair</option>
                                    <option value="Inspection">🔍 Inspection</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Assignee</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="" disabled>Select Personnel...</option>
                                    {/* Matched employees at the top with ✨ */}
                                    {employees
                                        .filter(emp => emp.expertise?.some(exp =>
                                            exp === newTask.taskType || (newTask.taskType === 'Repair' && exp === 'Service')
                                        ))
                                        .map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                🎯 {emp.name || emp.email?.split('@')[0] || 'Unknown'} (Perfect Match!)
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
                                                👤 {emp.name || emp.email?.split('@')[0] || 'Unknown'}
                                                {emp.expertise?.length > 0 ? ` (${emp.expertise.join(', ')})` : ' (No expertise set)'}
                                            </option>
                                        ))
                                    }
                                    {employees.length === 0 && (
                                        <option disabled>🚫 No employees found in system</option>
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
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-medium"
                                        value={newTask.clientName}
                                        onChange={(e) => setNewTask({ ...newTask, clientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deployment Zone</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Westside Avenue"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 placeholder:font-medium"
                                        value={newTask.location}
                                        onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Priority Level</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Normal">🟢 Routine (Normal)</option>
                                        <option value="High">🟠 Priority (High)</option>
                                        <option value="Urgent">🔴 Critical (Urgent)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deadline Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 flex items-center gap-3">
                            <button
                                onClick={() => setShowDispatchModal(false)}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignTask}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                Deploy Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReviewModal && selectedApproval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            {selectedApproval.status === 'Awaiting Approval' ? 'Review Task Log' : 'Task Details & Chat'}
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">Task ID: {selectedApproval.taskId} • {selectedApproval.clientName}</p>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <p className="text-xs font-bold text-slate-500 mb-1">Assigned Employee</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {selectedApproval.assignedTo?.name}
                                    {selectedApproval.assignedBy?._id === selectedApproval.assignedTo?._id && (
                                        <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-black uppercase">Self-Tasked</span>
                                    )}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <p className="text-xs font-bold text-slate-500 mb-1">Task Type</p>
                                <p className="text-sm font-bold text-slate-900">{selectedApproval.taskType}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <p className="text-xs font-bold text-slate-500 mb-1">Time Logged</p>
                                <p className="text-sm font-bold text-slate-900">{selectedApproval.timeElapsed || 0} mins</p>
                            </div>
                            {selectedApproval.notes && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-500 mb-1">Employee Notes</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedApproval.notes}</p>
                                </div>
                            )}

                            {selectedApproval.startLocation && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-blue-500 mb-1">GPS Capture Activity</p>
                                        <p className="text-[10px] text-blue-400">Captured: {selectedApproval.startLocation.lat.toFixed(4)}, {selectedApproval.startLocation.lng.toFixed(4)}</p>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${selectedApproval.startLocation.lat},${selectedApproval.startLocation.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <MapPin size={12} />
                                        View Map
                                    </a>
                                </div>
                            )}


                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Close</button>
                            {selectedApproval.status === 'Awaiting Approval' && (
                                <button onClick={() => { handleApprove(selectedApproval._id); setShowReviewModal(false); }} className="flex-1 py-3 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white rounded-xl transition-colors">Approve This Update</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Notification Toast */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 font-bold text-sm tracking-wide">
                    <CheckCircle size={18} className="text-emerald-400" />
                    {notification}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, linkTo }) => {
    const CardContent = (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group h-full hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500">
                {icon}
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 relative z-10">{title}</p>
            <div className="flex items-end gap-3 relative z-10">
                <h4 className="text-3xl font-display font-black text-slate-900">{value}</h4>
                <span className="text-xs font-bold text-emerald-500 mb-1">{trend}</span>
            </div>
        </div>
    );

    return linkTo ? <Link to={linkTo} className="block h-full cursor-pointer">{CardContent}</Link> : CardContent;
};

export default AdminTaskPanel;
