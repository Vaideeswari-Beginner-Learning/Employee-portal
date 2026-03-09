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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Notification Portal */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-emerald-500/90 text-white border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif italic text-gray-800">Leave Terminal</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage absence requests and entitlement metrics.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-teal px-6 py-2.5 text-sm flex items-center justify-center gap-2 shadow-none border-none ring-0 outline-none"
                >
                    <Plus size={16} /> New Leave Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LeaveStat label="Annual Balance" value="14 Days" color="text-primary-500" />
                <LeaveStat label="Pending Requests" value="01 Active" color="text-orange-500" />
                <LeaveStat label="Emergency Credit" value="03 Fixed" color="text-gray-400" />
            </div>

            <div className="card-hr bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h2 className="font-medium text-gray-700 italic">Temporal <span className="not-italic">Absence Logs</span></h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded border border-gray-100">Index: FY-2026</span>
                </div>

                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left bg-white border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Request Identity</th>
                                <th className="px-8 py-4">Protocol Duration</th>
                                <th className="px-8 py-4">Status Vector</th>
                                <th className="px-8 py-4 text-right">Registry Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaves.length > 0 ? leaves.map((leave, idx) => (
                                <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
                                                <Shield size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">{leave.leaveType}</p>
                                                <p className="text-[10px] text-gray-400 truncate max-w-xs italic mt-0.5">"{leave.reason}"</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={14} className="text-primary-500" />
                                            <span className="text-xs font-medium text-gray-600">{new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                leave.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {leave.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-[10px] font-bold text-gray-400 font-mono italic">
                                            {new Date(leave.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Plus size={40} className="text-gray-100" />
                                            <p className="text-xs text-gray-300 font-medium uppercase tracking-[0.2em]">No absence telemetry detected</p>
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg w-full max-w-lg shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-xl font-medium text-gray-800 italic flex items-center gap-3">
                                    <FileText className="text-primary-600" size={20} />
                                    Initiate <span className="text-primary-600 not-italic">Absence Request</span>
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-all rotate-45 text-3xl font-light">+</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Absence Vector (Type)</label>
                                    <select
                                        value={formData.leaveType}
                                        onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded p-4 text-xs font-bold text-gray-600 focus:outline-none focus:border-primary-600 appearance-none cursor-pointer"
                                    >
                                        <option>Annual</option>
                                        <option>Sickness</option>
                                        <option>Emergency</option>
                                        <option>Unpaid</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <LeaveInput label="Inception Date" type="date" value={formData.startDate} onChange={v => setFormData({ ...formData, startDate: v })} />
                                    <LeaveInput label="Termination Date" type="date" value={formData.endDate} onChange={v => setFormData({ ...formData, endDate: v })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Protocol Reasoning</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Identify the reason for absence..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded p-4 text-xs font-bold text-gray-600 focus:outline-none focus:border-primary-600 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-gray-50">
                                    <button onClick={() => setShowModal(false)} type="button" className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all">Abort</button>
                                    <button type="submit" className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white bg-primary-600 rounded hover:bg-primary-700 shadow-sm transition-all">Confirm Request</button>
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
    <div className="card-hr p-6 flex flex-col items-center text-center group cursor-default">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">{label}</p>
        <p className={`text-2xl font-black ${color} tracking-tighter uppercase`}>{value}</p>
    </div>
);

const LeaveInput = ({ label, type, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 font-mono">{label}</label>
        <input
            required
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded p-4 text-xs font-bold text-gray-600 focus:outline-none focus:border-primary-600 transition-all"
        />
    </div>
);

export default LeavePage;
