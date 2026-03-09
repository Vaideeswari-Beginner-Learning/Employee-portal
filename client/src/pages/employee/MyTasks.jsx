import { useState, useEffect } from 'react';
import TaskCard from '../../components/TaskCard';
import TaskDetailModal from '../../components/TaskDetailModal';
import { LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../utils/api';
import toast from 'react-hot-toast';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const res = await api.get('tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching my tasks:', err);
            toast.error('Failed to load your tasks');
        }
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-slate-900 mb-2 drop-shadow-sm">
                        My Field Tasks
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">
                        View and manage your assigned CCTV installation, maintenance, and repair operations.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                        <button
                            onClick={() => setFilter('All')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'All' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setFilter('Pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'Pending' ? 'bg-slate-100 text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('In Progress')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'In Progress' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Active
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                        + Self Task
                    </button>
                </div>
            </div>

            {/* Task Grid/List */}
            <motion.div
                layout
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
                <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TaskCard
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredTasks.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-6">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-700">No tasks found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or checking back later.</p>
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
    const [formData, setFormData] = useState({
        clientName: '',
        location: '',
        taskType: 'Maintenance',
        priority: 'Normal',
        dueDate: new Date().toISOString().split('T')[0]
    });

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900">Create Self-Task</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Task Title / Client</label>
                        <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} placeholder="e.g. Unplanned Fix" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Location Details</label>
                        <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Area or Address" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Type</label>
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.taskType} onChange={e => setFormData({ ...formData, taskType: e.target.value })}>
                                <option>Installation</option>
                                <option>Maintenance</option>
                                <option>Repair</option>
                                <option>Inspection</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Priority</label>
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                <option>Normal</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Date</label>
                        <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                    </div>

                    <button disabled={loading} type="submit" className="w-full mt-4 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Submit Task'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default MyTasks;
