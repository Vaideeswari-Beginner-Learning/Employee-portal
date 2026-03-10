import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FilePlus,
    ClipboardList,
    Send,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
    Settings,
    Shield,
    X,
    Upload,
    ChevronRight,
    MapPin,
    Eye,
    Camera,
    Calendar,
    ExternalLink
} from 'lucide-react';
import api from '../../utils/api';

const ReportsPage = () => {
    const [formData, setFormData] = useState({
        clientName: '',
        location: '',
        isInstalled: 'Yes',
        cameraCount: '',
        issues: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [notification, setNotification] = useState(null);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('employee/reports');
            setReports(res.data);
        } catch (err) {
            console.error('Fetch reports error:', err);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            await api.post('employee/submit-report', data);
            setSubmitted(true);
            showNotification('success', 'Field Telemetry Transmitted Successfully.');
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ clientName: '', location: '', isInstalled: 'Yes', cameraCount: '', issues: '', image: null });
                fetchReports();
            }, 3000);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            showNotification('error', 'Transmission failed: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-sky-50/50 p-6 md:p-10 rounded-[3rem] border border-sky-100 shadow-2xl">
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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Field<span className="text-sky-500 italic">.Reports</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Submit job telemetry and metrics</p>
                </div>
                <div className="px-4 py-2 bg-sky-50 border border-sky-100 rounded-xl text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] shadow-inner">
                    Protocol: ISO-SEC-9001
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                    <FilePlus size={18} className="text-sky-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Initiate New Deployment Report</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ReportInput label="Client Descriptor" value={formData.clientName} onChange={v => setFormData({ ...formData, clientName: v })} placeholder="Global Logistics Corp" />
                        <ReportInput label="Deployment Location" value={formData.location} onChange={v => setFormData({ ...formData, location: v })} placeholder="Sector 7, Hub B" icon={<MapPin size={14} />} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Installation Status</label>
                            <div className="flex gap-4">
                                {['Yes', 'No'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isInstalled: opt })}
                                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.isInstalled === opt ? 'bg-sky-500 text-slate-800 border-sky-500 shadow-lg shadow-sky-600/20' : 'bg-sky-50 text-slate-400 border-sky-100 hover:border-sky-500/30'}`}
                                    >
                                        {opt === 'Yes' ? 'Active' : 'Pending'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ReportInput label="Hardware Count (CCTV)" value={formData.cameraCount} onChange={v => setFormData({ ...formData, cameraCount: v })} placeholder="04 Units" type="number" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anomalies / Field Notes</label>
                        <textarea
                            value={formData.issues}
                            onChange={e => setFormData({ ...formData, issues: e.target.value })}
                            rows="4"
                            className="w-full bg-sky-50 border border-sky-100 rounded-2xl p-5 text-sm font-black text-slate-800 focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-800 outline-none shadow-inner uppercase tracking-tight"
                            placeholder="Identify any hardware conflicts or security gaps detected during deployment..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Evidence (Upload)</label>
                        <div className="relative border-2 border-dashed border-sky-100 rounded-[2rem] p-10 text-center hover:border-sky-500/50 transition-all bg-sky-50 group shadow-inner">
                            <input
                                type="file"
                                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-slate-800 mb-4 group-hover:text-sky-500 transition-colors" size={32} />
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                {formData.image ? formData.image.name : 'Drag files here or tap to capture'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-sky-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-orange-500/20">
                            <Shield size={12} /> SECURE CRYPTOGRAPHIC UPLINK
                        </div>
                        <button
                            type="submit"
                            disabled={loading || submitted}
                            className={`px-12 py-4 rounded-2xl flex items-center justify-center gap-3 transform active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl ${submitted ? 'bg-emerald-500 text-slate-800 shadow-emerald-500/20' : 'bg-sky-500 text-slate-800 shadow-sky-600/20 hover:bg-sky-700 border border-sky-400/20'}`}
                        >
                            {loading ? <Upload className="animate-spin" size={18} /> :
                                submitted ? <><CheckCircle size={18} /> Telemetry Synced</> :
                                    <><Send size={18} /> Transmit Report</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-sky-100 bg-sky-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-sky-500" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Tactical Logs Archive</h2>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left bg-sky-50/10">
                        <thead>
                            <tr className="border-b border-sky-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-sky-50">
                                <th className="px-8 py-5">Descriptor / Time-Stamp</th>
                                <th className="px-8 py-5">Location Space</th>
                                <th className="px-8 py-5">Status Vector</th>
                                <th className="px-8 py-5 text-right">Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                            {reports.length > 0 ? reports.map((report) => (
                                <tr key={report._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 shadow-inner">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">{report.clientName}</p>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                                    {new Date(report.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                            <MapPin size={12} className="text-sky-500" />
                                            {report.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
                                            ${report.isInstalled === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                                            {report.isInstalled === 'Yes' ? 'Operational' : 'Pending'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReport(report)}
                                            className="px-6 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-[10px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-500 hover:text-slate-800 hover:border-sky-500 transition-all shadow-xl ml-auto group"
                                        >
                                            Inspect <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ClipboardList size={40} className="text-gray-200" />
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">Zero Telemetry Detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-8 bg-sky-500/5 text-sky-500/60 rounded-[2rem] border border-sky-500/10 text-[9px] font-black uppercase tracking-[0.3em] text-center leading-relaxed backdrop-blur-sm">
                By submitting this document, you certify that all information is accurate and verified per the Installation Compliance Act of 2026.
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-sky-50 rounded-[3.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-sky-100 flex flex-col md:flex-row shadow-2xl"
                        >
                            {/* Side Image / Visualization Section */}
                            <div className="md:w-[55%] bg-sky-50 flex items-center justify-center p-12 relative group min-h-[400px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                                {selectedReport.image ? (
                                    <img
                                        src={`${api.defaults.baseURL.replace(/\/api\/?$/, '')}/uploads/${selectedReport.image}`}
                                        className="max-h-full max-w-full object-contain shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-2xl relative z-10 transition-transform group-hover:scale-[1.02] duration-700"
                                        alt="Field Evidence"
                                    />
                                ) : (
                                    <div className="text-center space-y-6 relative z-10">
                                        <div className="w-24 h-24 rounded-[2rem] bg-sky-50 flex items-center justify-center text-white/20 mx-auto border border-sky-100">
                                            <Camera size={48} />
                                        </div>
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">No Visual Capture Detected</p>
                                    </div>
                                )}
                                <div className="absolute top-8 left-8 px-5 py-2.5 bg-black/40 rounded-2xl text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] border border-sky-100 backdrop-blur-xl z-20 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Evidence Stream [Grid-Alpha]
                                </div>
                            </div>

                            {/* Deep Detail Section */}
                            <div className="md:w-[45%] p-12 lg:p-16 space-y-12 overflow-y-auto bg-white/50 backdrop-blur-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none uppercase mb-4">{selectedReport.clientName}</h2>
                                        <div className="flex items-center gap-3 text-sky-500">
                                            <MapPin size={14} className="animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedReport.location}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedReport(null)} className="w-14 h-14 rounded-2xl bg-sky-50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center group border border-sky-100">
                                        <X size={28} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-10 border-y border-sky-100 py-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Reporting Date</label>
                                        <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Hardware Matrix</label>
                                        <p className="text-sm font-black text-slate-200 uppercase tracking-tight tabular-nums">{selectedReport.cameraCount} Active Units</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Protocol Identity</label>
                                        <p className="text-xs font-black text-sky-500 tabular-nums bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20 inline-block tracking-tighter">#{selectedReport._id?.slice(-12).toUpperCase()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Logic Status</label>
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm
                                            ${selectedReport.isInstalled === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedReport.isInstalled === 'Yes' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-400'}`} />
                                            {selectedReport.isInstalled === 'Yes' ? 'Implemented' : 'Inbound'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Field Anomalies & Verification Log</label>
                                    <div className="bg-sky-50/50 p-8 rounded-[2rem] border border-sky-100 text-sm font-black text-slate-400 uppercase leading-relaxed relative overflow-hidden group tracking-tight">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/40" />
                                        "{selectedReport.issues || 'No anomalies detected during the physical deployment cycle and biometric verification.'}"
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-6">
                                    <button className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-sky-50 border border-sky-100 rounded-[1.5rem] hover:bg-sky-100 transition-all active:scale-[0.98]">Archive Data</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ReportInput = ({ label, value, onChange, placeholder, type = "text", icon }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500">{icon}</div>}
            <input
                required
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-800 outline-none shadow-inner uppercase tracking-tight ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

export default ReportsPage;


