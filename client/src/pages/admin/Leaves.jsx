import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Calendar,
    User,
    Shield,
    AlertCircle,
    Download,
    ChevronDown,
    MoreVertical
} from 'lucide-react';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        fetchLeaves();
    }, []);


    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const fetchLeaves = async () => {
        try {
            const res = await api.get('admin/leaves');
            setLeaves(res.data);
        } catch (err) {
            console.error('Admin leaves error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/admin/leaves/${id}`, { status });
            showNotification('success', `Authorization status updated to ${status}.`);
            fetchLeaves();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            showNotification('error', 'Action failed: ' + msg);
        }
    };

    const exportToCSV = () => {
        if (leaves.length === 0) return;
        const headers = ['Employee Name', 'Employee ID', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Reason'];
        const rows = leaves.map(l => [
            l.employee?.name || 'N/A',
            l.employee?.employeeId || 'N/A',
            l.leaveType,
            new Date(l.startDate).toLocaleDateString(),
            new Date(l.endDate).toLocaleDateString(),
            l.status,
            l.reason
        ]);

        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '';
            const res = String(str).replace(/"/g, '""');
            return `"${res}"`;
        };

        const csvContent = [headers, ...rows]
            .map(row => row.map(escapeCSV).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `absence_matrix_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('success', 'Absence Matrix Exported Successfully.');
    };

    const filtered = leaves.filter(l =>
        l.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">Absence<span className="text-sky-500 italic">.Auth</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Personnel Absence Authorization Interface</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 backdrop-blur-sm text-orange-400 px-6 py-3 border border-orange-500/20 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="relative">
                            <Clock size={16} className="animate-spin-slow" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{leaves.filter(l => l.status === 'Pending').length} Pending Requests</span>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="bg-sky-500 hover:bg-sky-700 text-slate-800 px-8 py-3.5 flex items-center gap-3 rounded-2xl shadow-lg shadow-sky-600/20 transition-all font-bold active:scale-95 text-xs uppercase tracking-widest"
                    >
                        <Download size={20} /> Absence Matrix
                    </button>
                </div>
            </div>

            <div className="card-premium flex flex-col shadow-2xl">
                <div className="p-8 border-b border-sky-100 flex items-center gap-6 bg-sky-50">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Search by personnel, type or reasoning..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-200 placeholder:text-slate-400 shadow-inner font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-sky-50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Personnel Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Absence Vector</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Temporal Range</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Registry Reason</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Auth Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                            {filtered.length > 0 ? filtered.map((leave) => (
                                <tr key={leave._id} className="hover:bg-primary-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-black text-sky-500 text-sm uppercase shadow-inner group-hover:scale-105 transition-transform">
                                                {leave.employee?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-none uppercase tracking-tight">{leave.employee?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">ID: {leave.employee?.employeeId || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[9px] font-black text-sky-500 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-[0.15em]">
                                            {leave.leaveType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-black text-slate-400 flex items-center gap-3 uppercase tracking-tighter tabular-nums bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 inline-flex">
                                            <Calendar size={14} className="text-slate-500" />
                                            {new Date(leave.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            <span className="text-slate-800 mx-1">â€”</span>
                                            {new Date(leave.endDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-medium text-slate-400 max-w-[250px] leading-relaxed italic border-l-2 border-sky-100 pl-4 py-1">"{leave.reason}"</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] shadow-sm
                                            ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-orange-500/5'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${leave.status === 'Approved' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : leave.status === 'Rejected' ? 'bg-red-400' : 'bg-orange-400 animate-pulse'}`} />
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {leave.status === 'Pending' ? (
                                            <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleAction(leave._id, 'Approved')}
                                                    className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-slate-800 hover:shadow-xl hover:shadow-emerald-500/20 transition-all focus:outline-none"
                                                    title="Authorize Protocol"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(leave._id, 'Rejected')}
                                                    className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-slate-800 hover:shadow-xl hover:shadow-red-500/20 transition-all focus:outline-none"
                                                    title="Registry Denial"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === leave._id ? null : leave._id)}
                                                    className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-slate-400 hover:text-sky-500 hover:border-sky-500/30 shadow-sm transition-all focus:outline-none"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                <AnimatePresence>
                                                    {activeDropdown === leave._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-sky-100 z-50 overflow-hidden"
                                                        >
                                                            <div className="p-2 space-y-1">
                                                                <button
                                                                    onClick={() => {
                                                                        showNotification('info', 'Registry permanently archived.');
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                                                                >
                                                                    Permanent Archive
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleAction(leave._id, 'Pending');
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-black uppercase text-orange-400 hover:bg-sky-50 hover:text-orange-300 transition-colors"
                                                                >
                                                                    Revoke Auth
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Absence Registry Nullified</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaves;


