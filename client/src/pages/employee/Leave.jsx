import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertCircle, Calendar, Hash, X, Shield, FileText, ChevronDown } from 'lucide-react';

const LeavePage = () => {
    const [leaves, setLeaves] = useState([]);
    const [adminLeaves, setAdminLeaves] = useState([]);
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
            // Filter admin leaves vs personal requests
            // Assuming admin leaves have a specific flag or are just distinct in the response
            setLeaves(res.data.filter(l => !l.isAdminEntered));
            setAdminLeaves(res.data.filter(l => l.isAdminEntered));
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Temporal <span className="text-sky-500">Absence Logs</span></h2>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 shadow-inner">Index: FY-2026</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-transparent border-collapse">
                            <thead>
                                <tr className="border-b border-sky-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Protocol</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-100">
                                {leaves.length > 0 ? leaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-sky-50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{leave.leaveType}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mt-0.5 truncate max-w-[150px]">"{leave.reason}"</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{new Date(leave.startDate).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                                                ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    leave.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                {leave.status}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">No requests detected</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    </div>
                    <div className="p-8 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-lg font-black text-white tracking-tight uppercase">Admin Assigned <span className="text-sky-500 italic">Leaves</span></h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Official Corporate Absence Nodes</p>
                    </div>

                    <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {adminLeaves.length > 0 ? adminLeaves.map((leave) => (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                key={leave._id}
                                className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between group hover:border-sky-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center justify-center text-sky-400">
                                        <span className="text-[10px] font-black leading-none">{new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-lg font-black leading-none tracking-tighter">{new Date(leave.startDate).getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">{leave.leaveType}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Clock size={10} className="text-sky-500" /> {new Date(leave.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="flex items-center gap-1"><Hash size={10} className="text-sky-500" /> REF: {leave._id?.slice(-4).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Shield size={16} className="text-slate-700 group-hover:text-sky-500 transition-colors" />
                            </motion.div>
                        )) : (
                            <div className="py-12 text-center">
                                <Calendar size={32} className="text-slate-800 mx-auto mb-3" />
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">No scheduled company absence</p>
                            </div>
                        )}
                    </div>
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


