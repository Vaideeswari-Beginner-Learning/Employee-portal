import { useState, useEffect, useRef } from 'react';
import TaskCard from '../../components/TaskCard';
import TaskDetailModal from '../../components/TaskDetailModal';
import { LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import api from '../../utils/api';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const containerRef = useRef();

    const fetchMyTasks = async () => {
        try {
            const res = await api.get('tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching my tasks:', err);
            toast.error('Failed to load your tasks');
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchMyTasks();
        };
        load();
    }, []);

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    useGSAP(() => {
        if (gsap.utils.toArray('.stagger-item').length > 0) {
            gsap.fromTo('.stagger-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, { scope: containerRef, dependencies: [filteredTasks.length, viewMode] });

    return (
        <div ref={containerRef} className="space-y-8 pb-20 bg-sky-50 min-h-screen p-6 md:p-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-sky-100">
                <div className="stagger-item opacity-0">
                    <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-slate-800 uppercase mb-2">
                        My Field <span className="text-sky-500 italic">.Tasks</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        View and manage assigned CCTV operations.
                    </p>
                </div>

                <div className="flex items-center gap-4 stagger-item opacity-0">
                    <div className="flex items-center p-1.5 bg-sky-50 border border-sky-100 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setFilter('All')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-sky-500 text-slate-800 shadow-xl shadow-sky-600/20' : 'text-slate-400 hover:text-slate-800'}`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setFilter('Pending')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'Pending' ? 'bg-slate-700 text-slate-800 shadow-sm border border-sky-100' : 'text-slate-400 hover:text-slate-800'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('In Progress')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'In Progress' ? 'bg-sky-500 text-slate-800 shadow-xl shadow-sky-600/20' : 'text-slate-400 hover:text-slate-800'}`}
                        >
                            Active
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center p-1.5 bg-sky-50 border border-sky-100 rounded-2xl shadow-inner">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-sky-500' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-700 text-sky-500' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 rounded-2xl bg-sky-500 text-slate-800 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95 border border-sky-400/20"
                    >
                        + Self Task
                    </button>
                </div>
            </div>

            {/* Task Grid/List */}
            <div
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
                {filteredTasks.map((task) => (
                    <div
                        key={task._id || task.id}
                        className="stagger-item opacity-0"
                    >
                        <TaskCard
                            task={task}
                            onClick={() => setSelectedTask(task)}
                        />
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-white border border-sky-100 flex items-center justify-center text-slate-500 mb-6 shadow-inner">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No tasks found</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Try adjusting your filters or checking back later.</p>
                </div>
            )}

            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onTaskUpdate={fetchMyTasks} // Wait for save to refresh
            />

            <CreateSelfTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchMyTasks}
            />
        </div>
    );
};

// Extracted internal component for the modal
const CreateSelfTaskModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const modalRef = useRef();
    const [formData, setFormData] = useState({
        clientName: '',
        location: '',
        taskType: 'Maintenance',
        priority: 'Normal',
        dueDate: new Date().toISOString().split('T')[0]
    });

    useGSAP(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let payload = { ...formData };

            await api.post('tasks', payload);
            toast.success('Task created successfully');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Task creation failed', err);
            toast.error(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
            <div
                ref={modalRef}
                className="bg-sky-50 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-md p-10 relative opacity-0 border border-sky-100"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Create <span className="text-sky-500 italic">Self-Task</span></h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full transition-colors text-lg font-black leading-none">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Task Title / Client</label>
                        <input required type="text" className="w-full p-4 bg-white border border-sky-100 rounded-xl text-slate-800 font-black text-sm focus:outline-none focus:border-sky-500 shadow-inner" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} placeholder="e.g. Unplanned Fix" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Location Details</label>
                        <input required type="text" className="w-full p-4 bg-white border border-sky-100 rounded-xl text-slate-800 font-black text-sm focus:outline-none focus:border-sky-500 shadow-inner" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Area or Address" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 text-slate-800">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Type</label>
                            <select className="w-full p-4 bg-white border border-sky-100 rounded-xl text-slate-800 font-black text-sm focus:outline-none focus:border-sky-500 shadow-inner" value={formData.taskType} onChange={e => setFormData({ ...formData, taskType: e.target.value })}>
                                <option>Installation</option>
                                <option>Maintenance</option>
                                <option>Repair</option>
                                <option>Inspection</option>
                            </select>
                        </div>
                        <div className="flex-1 text-slate-800">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Priority</label>
                            <select className="w-full p-4 bg-white border border-sky-100 rounded-xl text-slate-800 font-black text-sm focus:outline-none focus:border-sky-500 shadow-inner" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                <option>Normal</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Date</label>
                        <input required type="date" className="w-full p-4 bg-white border border-sky-100 rounded-xl text-slate-800 font-black text-sm focus:outline-none focus:border-sky-500 shadow-inner" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                    </div>

                    <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-sky-500 text-slate-800 font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-sky-700 disabled:opacity-50 shadow-xl shadow-sky-600/20 border border-sky-400/20">
                        {loading ? 'Creating...' : 'Submit Task'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MyTasks;


