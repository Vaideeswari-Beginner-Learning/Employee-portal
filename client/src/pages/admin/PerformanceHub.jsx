import { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, User, FileText, Download } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceHub = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateForm, setRateForm] = useState({
        rating: 5,
        comment: '',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        metrics: {
            taskCompletion: 100,
            attendanceScore: 100,
            teamworkScore: 100
        }
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('admin/employees');
            setEmployees(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load personnel roster');
            setLoading(false);
        }
    };

    const fetchHistory = async (empId) => {
        try {
            const res = await api.get(`performance/history/${empId}`);
            setReviews(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleSelectEmployee = (emp) => {
        setSelectedEmployee(emp);
        fetchHistory(emp._id);
    };

    const handleRate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`performance/rate/${selectedEmployee._id}`, rateForm);
            toast.success('Performance synchronized');
            setShowRateModal(false);
            fetchHistory(selectedEmployee._id);
            fetchEmployees(); // Update overall rating in list
        } catch (error) {
            toast.error('Sync failed');
        }
    };

    const exportToCSV = () => {
        if (reviews.length === 0) return toast.error('No data to export');

        const headers = ['Month', 'Rating', 'Comment', 'Reviewer'];
        const rows = reviews.map(rev => [
            rev.month,
            rev.rating,
            rev.comment.replace(/,/g, ';'), // Escape commas
            rev.reviewerId?.name || 'Admin'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedEmployee.name}_Performance_Report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report exported to CSV');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20 p-6 md:p-10 uppercase">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-white mb-2 uppercase">
                        Performance<span className="text-indigo-500 italic">.Hub</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Employee Analytics & Merit Sync</p>
                </div>
                {selectedEmployee && reviews.length > 0 && (
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:border-indigo-500/30 transition-all shadow-xl"
                    >
                        <Download size={16} /> Export Monthly Report
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Employee List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="card-premium overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Node Roster</h3>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto sidebar-scroll">
                            {employees.map(emp => (
                                <div
                                    key={emp._id}
                                    onClick={() => handleSelectEmployee(emp)}
                                    className={`p-5 flex items-center justify-between cursor-pointer transition-all ${selectedEmployee?._id === emp._id ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-500 uppercase shadow-inner">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase">{emp.name}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{emp.employeeId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-xs font-black">{emp.performanceRating || '0.0'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Details */}
                <div className="lg:col-span-2">
                    {selectedEmployee ? (
                        <div className="space-y-6">
                            <div className="card-premium p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-600/30 uppercase">
                                            {selectedEmployee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white uppercase">{selectedEmployee.name}</h2>
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{selectedEmployee.email}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 text-amber-400 rounded-lg border border-white/10 shadow-inner">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => {
                                                            const rating = selectedEmployee.performanceRating || 0;
                                                            return (
                                                                <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : (i < rating ? "currentColor" : "none")} className={i < rating ? "text-amber-400" : "text-slate-700"} />
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] font-black ml-1 text-amber-400 uppercase tracking-widest">{selectedEmployee.performanceRating || '0.0'} Merit</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRateModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-600/20 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95"
                                    >
                                        Initiate Review
                                    </button>
                                </div>

                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-1">Recent Merit Cycles</h3>
                                <div className="space-y-3">
                                    {reviews.map(rev => (
                                        <div key={rev._id} className="p-5 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors shadow-inner">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-slate-600" />
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rev.month}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "text-amber-400" : "text-slate-700"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <MetricSmall label="Tasks" value={rev.metrics?.taskCompletion} color="text-emerald-400" />
                                                <MetricSmall label="Attendance" value={rev.metrics?.attendanceScore} color="text-amber-400" />
                                                <MetricSmall label="Teamwork" value={rev.metrics?.teamworkScore} color="text-indigo-400" />
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-t border-white/5 pt-3 mt-3">"{rev.comment || 'No specific feedback provided for this cycle.'}"</p>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && (
                                        <div className="py-20 text-center text-slate-400">
                                            <FileText size={40} className="mx-auto mb-4 opacity-10" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No review cycles logged</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-[2rem] h-[600px] flex flex-col items-center justify-center text-slate-600 shadow-inner backdrop-blur-sm">
                            <TrendingUp size={60} className="mb-6 opacity-10" />
                            <h3 className="text-lg font-black text-white tracking-tight uppercase">Select a Personnel Node</h3>
                            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest">Review performance history across operational cycles.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showRateModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1E293B] rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl overflow-hidden relative border border-white/10"
                        >
                            <h2 className="text-2xl font-black text-white mb-1">Initiate Review Cycle</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Node: {selectedEmployee.name}</p>

                            <form onSubmit={handleRate} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp size={12} /> Task Completion Score (0-100)
                                    </label>
                                    <input
                                        type="number" min="0" max="100" required
                                        value={rateForm.metrics.taskCompletion}
                                        onChange={(e) => setRateForm({ ...rateForm, metrics: { ...rateForm.metrics, taskCompletion: parseInt(e.target.value) || 0 } })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp size={12} /> Attendance Score (0-100)
                                    </label>
                                    <input
                                        type="number" min="0" max="100" required
                                        value={rateForm.metrics.attendanceScore}
                                        onChange={(e) => setRateForm({ ...rateForm, metrics: { ...rateForm.metrics, attendanceScore: parseInt(e.target.value) || 0 } })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp size={12} /> Teamwork Score (0-100)
                                    </label>
                                    <input
                                        type="number" min="0" max="100" required
                                        value={rateForm.metrics.teamworkScore}
                                        onChange={(e) => setRateForm({ ...rateForm, metrics: { ...rateForm.metrics, teamworkScore: parseInt(e.target.value) || 0 } })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Star size={12} /> Performance Rating (1-5 Vector)
                                    </label>
                                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-white/10 shadow-inner">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRateForm({ ...rateForm, rating: s })}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rateForm.rating >= s ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-700 border border-white/10'}`}
                                            >
                                                <Star size={20} fill={rateForm.rating >= s ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={12} /> Operational Feedback
                                    </label>
                                    <textarea
                                        required
                                        value={rateForm.comment}
                                        onChange={(e) => setRateForm({ ...rateForm, comment: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700 outline-none"
                                        rows="4"
                                        placeholder="Detailed performance summary..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRateModal(false)}
                                        className="flex-1 py-4 text-[10px] font-black text-slate-500 bg-white/5 border border-white/10 rounded-2xl uppercase tracking-widest hover:bg-white/10"
                                    >
                                        Abort Cycle
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                                    >
                                        Sync Merit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MetricSmall = ({ label, value, color }) => (
    <div className="bg-white/5 rounded-xl p-2 border border-white/5">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-black ${color}`}>{value || 0}%</p>
    </div>
);

export default PerformanceHub;
