import { Calendar, MapPin, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const priorityColors = {
    High: 'bg-rose-50 text-rose-600 border-rose-200',
    Medium: 'bg-orange-50 text-orange-600 border-orange-200',
    Normal: 'bg-blue-50 text-blue-600 border-blue-200'
};

const statusColors = {
    'Pending': 'from-white to-slate-50 border-slate-200/60',
    'In Progress': 'from-blue-50/50 to-white border-blue-200',
    'Completed': 'from-emerald-50/50 to-white border-emerald-200'
};

const TaskCard = ({ task, onClick }) => {
    return (
        <motion.div
            layoutId={`task-${task.id}`}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`cursor-pointer w-full p-6 rounded-3xl bg-gradient-to-br ${statusColors[task.status]} border shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all group relative overflow-hidden`}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:to-blue-500/5 transition-all" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200/60 ${priorityColors[task.priority]}`}>
                        {task.priority} Priority
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100/80 text-slate-600 border border-slate-200">
                        {task.taskType}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                    <Calendar size={14} className="text-slate-400" />
                    {task.dueDate}
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <h3 className="text-xl font-display font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {task.clientName}
                </h3>
                <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-[13px] font-medium">{task.location}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : task.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                        {task.status}
                    </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                    <ChevronRight size={16} />
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
