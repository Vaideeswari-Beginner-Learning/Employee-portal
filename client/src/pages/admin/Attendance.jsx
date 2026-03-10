import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Calendar, User, Clock, CheckCircle, XCircle, MoreHorizontal, Activity, AlertCircle } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('admin/attendance');
                setAttendance(res.data);
            } catch (err) {
                console.error('Attendance fetch error:', err.response?.data || err.message);
                showNotification('error', 'Failed to retrieve attendance matrix.');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const filtered = attendance.filter(record => {
        const empName = record.employee?.name || '';
        const empId = record.employee?.employeeId || '';
        return empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            empId.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Photo Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                        className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-2xl w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={selectedPhoto} alt="Biometric ID" className="w-full h-auto" />
                            <div className="p-8 text-center bg-slate-900">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity Verification Frame</p>
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    className="mt-6 px-8 py-3 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                                >
                                    Close Terminal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Portal */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : notification.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-900/90 text-white border-slate-700'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-white tracking-tight leading-none">Duty<span className="text-primary-500 italic">.Logs</span></h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Global Attendance Telemetry & Persistence</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-primary-400 hover:border-primary-500/30 transition-all flex items-center gap-2 shadow-sm">
                        <Calendar size={16} />
                        <span className="uppercase tracking-widest">Temporal Buffer</span>
                    </button>
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 flex items-center gap-3 rounded-2xl shadow-lg shadow-primary-500/20 transition-all font-bold active:scale-95">
                        <Download size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Export Core</span>
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card-premium flex flex-col bg-slate-800/50 backdrop-blur-xl shadow-2xl border-white/5">
                <div className="p-8 border-b border-white/5 flex items-center gap-6 bg-white/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            placeholder="Search by personnel name or identity node..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-200 placeholder:text-slate-500 shadow-inner font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Personnel Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Date Matrix</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Inception</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">GPS Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Biometric ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Verification</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((record) => (
                                <motion.tr variants={itemVariants} key={record._id} className="hover:bg-primary-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-700 border border-white/10 flex items-center justify-center font-black text-slate-400 text-sm uppercase shadow-sm group-hover:scale-105 transition-transform">
                                                {record.employee?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-100 leading-none mb-1.5">{record.employee?.name || 'Unknown'}</p>
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">ID: {record.employee?.employeeId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/10 inline-block">
                                            {new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                                    <Clock size={12} />
                                                </div>
                                                <p className="text-xs font-black text-slate-200 tabular-nums">In: {record.checkIn || '--:--'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
                                                    <Clock size={12} />
                                                </div>
                                                <p className="text-xs font-black text-slate-200 tabular-nums">Out: {record.checkOut || '--:--'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 tracking-tighter leading-relaxed">
                                                {record.locationName || (record.latitude ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}` : 'No Location Data')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {record.biometricPhoto ? (
                                            <div
                                                onClick={() => setSelectedPhoto(record.biometricPhoto)}
                                                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-primary-500 transition-all shadow-sm group/bio"
                                            >
                                                <img src={record.biometricPhoto} alt="Bio" className="w-full h-full object-cover group-hover/bio:scale-110 transition-transform" />
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-black text-slate-300 uppercase">No Visual ID</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]
                                            ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'Present' ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`} />
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === record._id ? null : record._id)}
                                            className="p-2.5 bg-slate-800 border border-white/5 rounded-xl text-slate-500 hover:text-primary-400 hover:border-primary-500/30 shadow-sm transition-all focus:outline-none"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        <AnimatePresence>
                                            {openMenuId === record._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-8 top-16 w-48 bg-slate-900 rounded-2xl shadow-2xl border border-white/10 py-2 z-50 text-left overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            showNotification('success', 'View Details action triggered');
                                                        }}
                                                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-primary-400 text-left transition-colors flex items-center gap-2"
                                                    >
                                                        View Full Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            showNotification('success', 'Edit Record action triggered');
                                                        }}
                                                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-orange-400 text-left transition-colors flex items-center gap-2"
                                                    >
                                                        Edit Record
                                                    </button>
                                                    <div className="h-px bg-white/5 my-1 w-full" />
                                                    <button
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            showNotification('error', 'Delete Record action triggered');
                                                        }}
                                                        className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 text-left transition-colors flex items-center gap-2"
                                                    >
                                                        Delete Record
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </td>
                                </motion.tr>
                            )) : (
                                <motion.tr variants={itemVariants}>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-slate-800">
                                                <Activity size={48} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-black uppercase tracking-[0.4em]">Zero Telemetry Inbound</p>
                                                <p className="text-[10px] text-slate-600 font-medium mt-2">No active personnel logs detected in the core database.</p>
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminAttendance;
