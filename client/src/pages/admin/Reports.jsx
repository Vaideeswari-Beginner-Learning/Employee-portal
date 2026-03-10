import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    MapPin,
    Camera,
    CheckCircle,
    X,
    FileText,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [notification, setNotification] = useState(null);


    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('admin/reports');
                setReports(res.data);
            } catch (err) {
                console.error('Reports fetch error:', err.response?.data || err.message);
                showNotification('error', 'Critical synchronization failure.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const downloadCSV = () => {
        if (reports.length === 0) return showNotification('info', 'No telemetry to export.');

        const headers = ['Client', 'Employee', 'Location', 'Cameras', 'Status', 'Date', 'Anomalies'];
        const rows = reports.map(r => [
            r.clientName,
            r.employee?.name || r.employeeName,
            r.location,
            r.cameraCount,
            r.isInstalled,
            new Date(r.createdAt).toLocaleDateString(),
            r.issues || 'None'
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
        link.setAttribute("download", `Field_Telemetry_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('success', 'Batch Matrix Export Initialized.');
    };

    const filtered = reports.filter(r =>
        r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : notification.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-900/90 text-white border-slate-700'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">Field<span className="text-primary-500 italic">.Documents</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Advanced Deployment Telemetry & Archive</p>
                </div>
                <button
                    onClick={downloadCSV}
                    className="btn-teal px-8 py-3.5 flex items-center gap-3 active:scale-95 transition-all"
                >
                    <Download size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Batch Matrix Export</span>
                </button>
            </div>

            <div className="card-premium flex flex-col bg-white/50 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white/50">
                <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-white/30">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            placeholder="Search by client, location, or personnel node..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Descriptor Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Personnel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Location Space</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">HW Metrics</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Registry</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Deep Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((report) => (
                                <tr key={report._id} className="hover:bg-primary-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl border ${report.isInstalled === 'Yes' ? 'bg-emerald-50 text-emerald-500 border-emerald-100 shadow-sm' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{report.clientName}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${report.isInstalled === 'Yes' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                    {report.isInstalled === 'Yes' ? 'Active Deployment' : 'Pending Verification'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{report.employee?.name || report.employeeName}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            <MapPin size={12} className="text-primary-500" />
                                            {report.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tabular-nums">
                                            {report.cameraCount} Optical Units
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-[11px] text-slate-400 font-black uppercase tracking-tighter">
                                        {new Date(report.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-primary-500 uppercase tracking-widest hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2 ml-auto"
                                        >
                                            Inspect <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Zero Document Telemetry Detected</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/50 flex flex-col md:flex-row shadow-2xl"
                        >
                            {/* Side Image / Visualization Section */}
                            <div className="md:w-[55%] bg-slate-900 flex items-center justify-center p-12 relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
                                {selectedReport.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : ''}/uploads/${selectedReport.image}`}
                                        className="max-h-full max-w-full object-contain shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-2xl relative z-10 transition-transform group-hover:scale-[1.02] duration-700"
                                        alt="Field Evidence"
                                    />
                                ) : (
                                    <div className="text-center space-y-6 relative z-10">
                                        <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/20 mx-auto border border-white/5">
                                            <Camera size={48} />
                                        </div>
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">No Visual Capture Detected</p>
                                    </div>
                                )}
                                <div className="absolute top-8 left-8 px-5 py-2.5 bg-black/40 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.25em] border border-white/10 backdrop-blur-xl z-20 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Evidence Stream [Grid-Alpha]
                                </div>
                            </div>

                            {/* Deep Detail Section */}
                            <div className="md:w-[45%] p-12 lg:p-16 space-y-12 overflow-y-auto bg-white/50 backdrop-blur-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none mb-4">{selectedReport.clientName}</h2>
                                        <div className="flex items-center gap-3 text-primary-500">
                                            <MapPin size={14} className="animate-bounce" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedReport.location}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedReport(null)} className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center group border border-slate-100">
                                        <X size={28} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-10 border-y border-slate-100 py-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Deployed By</label>
                                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{selectedReport.userId?.name || selectedReport.employeeName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Hardware Matrix</label>
                                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight tabular-nums">{selectedReport.cameraCount} Active Units</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Protocol Identity</label>
                                        <p className="text-xs font-black text-primary-500 tabular-nums bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 inline-block tracking-tighter">#{selectedReport._id?.slice(-12).toUpperCase()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Logic Status</label>
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm
                                            ${selectedReport.isInstalled === 'Yes' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedReport.isInstalled === 'Yes' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`} />
                                            {selectedReport.isInstalled === 'Yes' ? 'Implemented' : 'Inbound'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Field Anomalies & Verification Log</label>
                                    <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed italic relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/20" />
                                        "{selectedReport.issues || 'No anomalies detected during the physical deployment cycle and biometric verification.'}"
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-6">
                                    <button className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-white bg-primary-500 shadow-2xl shadow-primary-500/30 rounded-[1.5rem] hover:bg-primary-600 transition-all active:scale-[0.98]">Verify Artifact</button>
                                    <button className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50 border border-slate-200 rounded-[1.5rem] hover:bg-slate-100 transition-all active:scale-[0.98]">Archive Data</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminReports;
