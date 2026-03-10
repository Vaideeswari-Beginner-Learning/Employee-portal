import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertCircle, Calendar, Hash, X, Shield, FileText, ChevronDown } from 'lucide-react';

const LeavePage = () => {
    const [leaves, setLeaves] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };


    const fetchLeaves = async () => {
        try {
            const res = await api.get('employee/leave');
            setLeaves(res.data);
        } catch (err) {
            console.error('Fetch leaves error:', err.response?.data || err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('employee/request-leave', formData);
            setShowModal(false);
            setFormData({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
            showNotification('success', 'Absence request initiated successfully.');
            fetchLeaves();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            showNotification('error', 'Request failed: ' + msg);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-sky-50 min-h-screen p-6 md:p-10">
            {/* Notification Portal */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-slate-800 border-red-400' : 'bg-emerald-500/90 text-slate-800 border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Leave<span className="text-sky-500 italic">.Terminal</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Manage absence requests and entitlement metrics.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2.5 bg-sky-500 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20 hover:bg-sky-700 transition-all flex items-center justify-center gap-2 border border-sky-400/20"
                >
                    <Plus size={16} /> New Leave Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LeaveStat label="Annual Balance" value="14 Days" color="text-sky-500" />
                <LeaveStat label="Pending Requests" value="01 Active" color="text-orange-500" />
                <LeaveStat label="Emergency Credit" value="03 Fixed" color="text-slate-400" />
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Temporal <span className="text-sky-500">Absence Logs</span></h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 shadow-inner">Index: FY-2026</span>
                </div>

                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left bg-transparent border-collapse">
                        <thead>
                            <tr className="border-b border-sky-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Request Identity</th>
                                <th className="px-8 py-4">Protocol Duration</th>
                                <th className="px-8 py-4">Status Vector</th>
                                <th className="px-8 py-4 text-right">Registry Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                            {leaves.length > 0 ? leaves.map((leave, idx) => (
                                <tr key={leave._id} className="hover:bg-sky-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 shadow-inner">
                                                <Shield size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{leave.leaveType}</p>
                                                <p className="text-[10px] font-black text-slate-400 truncate max-w-xs uppercase tracking-tight mt-0.5">"{leave.reason}"</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={14} className="text-sky-500" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-tight">{new Date(leave.startDate).toLocaleDateString()} â€” {new Date(leave.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                                            ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                leave.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {leave.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                            {new Date(leave.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Plus size={40} className="text-slate-800" />
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">No absence telemetry detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-sky-50 border border-sky-100 rounded-3xl w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="p-8 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                    <FileText className="text-sky-500" size={20} />
                                    Initiate <span className="text-sky-500 italic">Absence Request</span>
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 transition-all rotate-45 text-3xl font-light">+</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Absence Vector (Type)</label>
                                    <div className="relative">
                                        <select
                                            value={formData.leaveType}
                                            onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                            className="w-full bg-white border border-sky-100 rounded-xl p-4 text-xs font-black text-slate-800 focus:outline-none focus:border-sky-500 appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option>Annual</option>
                                            <option>Sickness</option>
                                            <option>Emergency</option>
                                            <option>Unpaid</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <LeaveInput label="Inception Date" type="date" value={formData.startDate} onChange={v => setFormData({ ...formData, startDate: v })} />
                                    <LeaveInput label="Termination Date" type="date" value={formData.endDate} onChange={v => setFormData({ ...formData, endDate: v })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol Reasoning</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Identify the reason for absence..."
                                        className="w-full bg-white border border-sky-100 rounded-xl p-4 text-xs font-black text-slate-800 focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-700 shadow-inner"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-sky-100">
                                    <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-sky-100 rounded-xl hover:bg-slate-700 transition-all">Abort</button>
                                    <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 bg-sky-500 rounded-xl hover:bg-sky-700 shadow-xl shadow-sky-600/20 transition-all border border-sky-400/20">Confirm Request</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LeaveStat = ({ label, value, color }) => (
    <div className="bg-white/50 backdrop-blur-xl border border-sky-100 p-6 rounded-3xl flex flex-col items-center text-center group cursor-default shadow-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-2xl font-black ${color} tracking-tighter uppercase`}>{value}</p>
    </div>
);

const LeaveInput = ({ label, type, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        <input
            required
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white border border-sky-100 rounded-xl p-4 text-xs font-black text-slate-800 focus:outline-none focus:border-sky-500 transition-all shadow-inner"
        />
    </div>
);

export default LeavePage;


