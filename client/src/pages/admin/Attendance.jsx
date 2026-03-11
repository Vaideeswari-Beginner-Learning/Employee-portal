import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Calendar, Clock, CheckCircle, XCircle, MoreHorizontal, Activity, AlertCircle, X, MapPin, User, Badge } from 'lucide-react';

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
    const [selectedRecord, setSelectedRecord] = useState(null); // Deep Analysis modal

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
            {/* === DEEP ANALYSIS POPUP MODAL === */}
            <AnimatePresence>
                {selectedRecord && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedRecord(null)}
                        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="relative max-w-md w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-sky-100"
                        >
                            {/* Header gradient banner */}
                            <div className="h-32 bg-gradient-to-br from-sky-400 to-blue-600 relative flex items-end p-6">
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
                                >
                                    <X size={18} />
                                </button>
                                <div className="flex items-center gap-4">
                                    {/* Employee photo or avatar */}
                                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-sky-200 flex items-center justify-center">
                                        {selectedRecord.biometricPhoto ? (
                                            <img src={selectedRecord.biometricPhoto} alt="Employee" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-sky-600 uppercase">
                                                {selectedRecord.employee?.name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white uppercase tracking-tight leading-none">
                                            {selectedRecord.employee?.name || 'Unknown'}
                                        </p>
                                        <p className="text-sky-200 text-[10px] font-black uppercase tracking-widest mt-1">
                                            ID: {selectedRecord.employee?.employeeId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-8 space-y-5">
                                {/* Date */}
                                <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                    <div className="p-3 bg-sky-500 rounded-xl text-white shadow-md shadow-sky-300/40">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                        <p className="text-sm font-black text-slate-800">
                                            {new Date(selectedRecord.date).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Check In / Check Out */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={14} className="text-emerald-500" />
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Check In</p>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 tabular-nums">
                                            {selectedRecord.checkIn
                                                ? new Date(selectedRecord.checkIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : '--:--'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={14} className="text-orange-500" />
                                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Check Out</p>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 tabular-nums">
                                            {selectedRecord.checkOut
                                                ? new Date(selectedRecord.checkOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : '--:--'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Status</p>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedRecord.status === 'Present'
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-red-100 text-red-600 border-red-200'
                                        }`}>
                                        {selectedRecord.status}
                                    </span>
                                </div>

                                {/* Location */}
                                {(selectedRecord.locationName || selectedRecord.latitude) && (
                                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="p-3 bg-blue-500 rounded-xl text-white shadow-md shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPS Location</p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {selectedRecord.locationName || `${selectedRecord.latitude?.toFixed(4)}, ${selectedRecord.longitude?.toFixed(4)}`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-300/40 hover:from-sky-600 hover:to-blue-700 transition-all active:scale-95"
                                >
                                    Close Analysis
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Photo Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                        className="fixed inset-0 z-[300] bg-sky-50/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-2xl w-full bg-sky-50 rounded-[3rem] overflow-hidden shadow-2xl border border-sky-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={selectedPhoto} alt="Biometric ID" className="w-full h-auto" />
                            <div className="p-8 text-center bg-sky-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Verification Frame</p>
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    className="mt-6 px-8 py-3 bg-sky-500 text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
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
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-slate-800 border-red-400' : notification.type === 'success' ? 'bg-emerald-500/90 text-slate-800 border-emerald-400' : 'bg-sky-50/90 text-slate-800 border-slate-700'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">Duty<span className="text-sky-500 italic">.Logs</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Global Attendance Telemetry & Persistence</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-sky-50 border border-sky-100 rounded-2xl text-[10px] font-black text-slate-400 hover:text-sky-500 hover:border-sky-500/30 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
                        <Calendar size={16} /> Temporal Buffer
                    </button>
                    <button className="bg-sky-500 hover:bg-sky-700 text-slate-800 px-8 py-3.5 flex items-center gap-3 rounded-2xl shadow-lg shadow-sky-600/20 transition-all font-bold active:scale-95 text-xs uppercase tracking-widest">
                        <Download size={20} /> Export Core
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card-premium flex flex-col shadow-2xl">
                <div className="p-8 border-b border-sky-100 flex items-center gap-6 bg-sky-50">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Search by personnel name or identity node..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-sky-200 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 placeholder:text-slate-400 shadow-inner font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-sky-50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Personnel Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Date Matrix</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Inception</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">GPS Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Biometric ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Verification</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((record) => (
                                <motion.tr variants={itemVariants} key={record._id} className="hover:bg-primary-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-black text-sky-500 text-sm uppercase shadow-inner group-hover:scale-105 transition-transform">
                                                {record.employee?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-700 leading-none mb-1.5">{record.employee?.name || 'Unknown'}</p>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">ID: {record.employee?.employeeId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 inline-block">
                                            {new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                                    <Clock size={12} />
                                                </div>
                                                <p className="text-xs font-black text-slate-700 tabular-nums">In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
                                                    <Clock size={12} />
                                                </div>
                                                <p className="text-xs font-black text-slate-700 tabular-nums">Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}</p>
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
                                                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-sky-100 cursor-pointer hover:border-primary-500 transition-all shadow-sm group/bio"
                                            >
                                                <img src={record.biometricPhoto} alt="Bio" className="w-full h-full object-cover group-hover/bio:scale-110 transition-transform blur-[2px] hover:blur-none" title="Biometric ID Photo" />
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
                                            className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-slate-400 hover:text-sky-500 hover:border-sky-500/30 shadow-sm transition-all focus:outline-none"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        <AnimatePresence>
                                            {openMenuId === record._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-2xl border border-sky-100 py-2 z-50 text-left overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            setSelectedRecord(record);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-sky-50 hover:text-sky-600 text-left transition-colors flex items-center gap-2"
                                                    >
                                                        <Activity size={14} /> Deep Analysis
                                                    </button>
                                                    <div className="h-px bg-sky-50 my-1 w-full" />
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Confirm permanent deletion of this shift record?')) {
                                                                try {
                                                                    await api.delete(`admin/attendance/${record._id}`);
                                                                    setAttendance(prev => prev.filter(a => a._id !== record._id));
                                                                    showNotification('success', 'Shift Record Purged');
                                                                } catch (err) {
                                                                    showNotification('error', 'Purge Failed');
                                                                }
                                                            }
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 text-left transition-colors flex items-center gap-2"
                                                    >
                                                        Purge Record
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
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-sky-50 flex items-center justify-center text-slate-800">
                                                <Activity size={48} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.4em]">Zero Telemetry Inbound</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-2">No active personnel logs detected in the core database.</p>
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


