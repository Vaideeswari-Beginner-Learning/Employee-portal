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
            tasksCompleted: 0,
            attendanceRate: 100,
            onTimeArrival: 100
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-slate-900 mb-2">
                        Performance<span className="text-primary-500 italic">.Hub</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Employee Analytics & Merit Sync</p>
                </div>
                {selectedEmployee && reviews.length > 0 && (
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <Download size={16} /> Export Monthly Report
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Employee List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personnel Node Roster</h3>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {employees.map(emp => (
                                <div
                                    key={emp._id}
                                    onClick={() => handleSelectEmployee(emp)}
                                    className={`p-5 flex items-center justify-between cursor-pointer transition-all ${selectedEmployee?._id === emp._id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.employeeId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-orange-500">
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
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-primary-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/20 uppercase">
                                            {selectedEmployee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">{selectedEmployee.name}</h2>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedEmployee.email}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="text-xs font-black">{selectedEmployee.performanceRating || '0.0'} Merit</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRateModal(true)}
                                        className="btn-primary-small px-6"
                                    >
                                        Initiate Review
                                    </button>
                                </div>

                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Recent Merit Cycles</h3>
                                <div className="space-y-3">
                                    {reviews.map(rev => (
                                        <div key={rev._id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{rev.month}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.rating ? "#f59e0b" : "none"} className={i < rev.rating ? "text-orange-500" : "text-slate-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{rev.comment || 'No specific feedback provided for this cycle.'}"</p>
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
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] h-[600px] flex flex-col items-center justify-center text-slate-400">
                            <TrendingUp size={60} className="mb-6 opacity-10" />
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Select a Personnel Node</h3>
                            <p className="text-sm font-medium mt-1">Review performance history across operational cycles.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showRateModal && selectedEmployee && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl overflow-hidden relative"
                        >
                            <h2 className="text-2xl font-black text-slate-900 mb-1">Initiate Review Cycle</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Node: {selectedEmployee.name}</p>

                            <form onSubmit={handleRate} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Star size={12} /> Merit Rating (1-5 Vector)
                                    </label>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRateForm({ ...rateForm, rating: s })}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rateForm.rating >= s ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-slate-300 border border-slate-100'}`}
                                            >
                                                <Star size={20} fill={rateForm.rating >= s ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={12} /> Operational Feedback
                                    </label>
                                    <textarea
                                        required
                                        value={rateForm.comment}
                                        onChange={(e) => setRateForm({ ...rateForm, comment: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-primary-500 focus:bg-white transition-all placeholder:text-slate-200"
                                        rows="4"
                                        placeholder="Detailed performance summary..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRateModal(false)}
                                        className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl uppercase tracking-widest"
                                    >
                                        Abort Cycle
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 text-[10px] font-black text-white bg-primary-500 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all"
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

export default PerformanceHub;
