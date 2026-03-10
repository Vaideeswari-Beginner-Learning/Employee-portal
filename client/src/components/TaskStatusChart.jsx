import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskStatusChart = ({ tasks = [] }) => {
    const navigate = useNavigate();

    // Map database statuses to chart categories
    const statusCounts = {
        'Todo': 0, // Pending
        'In Progress': 0, // In Progress
        'In Review': 0, // Awaiting Approval
        'Done': 0 // Completed
    };

    tasks.forEach(task => {
        if (task.status === 'Pending') statusCounts['Todo']++;
        else if (task.status === 'In Progress') statusCounts['In Progress']++;
        else if (task.status === 'Awaiting Approval') statusCounts['In Review']++;
        else if (task.status === 'Completed') statusCounts['Done']++;
        else statusCounts['Todo']++; // Fallback
    });

    // If no tasks exist, show a hollow placeholder
    const totalTasks = tasks.length;

    // Chart Data
    const data = [
        { name: 'Todo', value: totalTasks === 0 ? 0 : statusCounts['Todo'], color: '#bfdbfe' }, // light blue
        { name: 'In Progress', value: totalTasks === 0 ? 0 : statusCounts['In Progress'], color: '#60a5fa' }, // medium light blue
        { name: 'In Review', value: totalTasks === 0 ? 0 : statusCounts['In Review'], color: '#3b82f6' }, // medium blue
        { name: 'Done', value: totalTasks === 0 ? 0 : statusCounts['Done'], color: '#1d4ed8' }, // dark blue
    ];

    // Fallback data if completely empty so the donut still draws a gray circle
    const displayData = totalTasks > 0 ? data : [{ name: 'No Tasks', value: 1, color: '#f1f5f9' }];

    return (
        <div className="card-premium p-6 bg-white shadow-sm border border-slate-100/50 flex flex-col h-full min-h-[440px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100/50 text-slate-500">
                        <BarChart2 size={16} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Tasks</span>
                </div>
                <button
                    onClick={() => navigate('/tasks')}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ChevronRight size={14} className="text-slate-400" />
                    See kanban board
                </button>
            </div>

            {/* Donut Chart */}
            <div className="flex-1 w-full relative min-h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={1}
                            dataKey="value"
                            stroke="white"
                            strokeWidth={2}
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        {totalTasks > 0 && <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />}
                    </PieChart>
                </ResponsiveContainer>

                {/* Center total if needed, optional */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-display font-black text-slate-800">{totalTasks}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-8 px-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-sm shadow-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskStatusChart;
