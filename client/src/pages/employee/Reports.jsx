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
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif italic text-gray-800">Field Reports</h1>
                    <p className="text-xs text-gray-500 mt-1">Submit job telemetry and installation metrics.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-gray-100 rounded text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] shadow-sm">
                    Protocol: ISO-SEC-9001
                </div>
            </div>

            <div className="card-hr bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <FilePlus size={18} className="text-primary-600" />
                    <h2 className="font-medium text-gray-700 italic">Initiate <span className="not-italic">New Report</span></h2>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ReportInput label="Client Descriptor" value={formData.clientName} onChange={v => setFormData({ ...formData, clientName: v })} placeholder="Global Logistics Corp" />
                        <ReportInput label="Deployment Location" value={formData.location} onChange={v => setFormData({ ...formData, location: v })} placeholder="Sector 7, Hub B" icon={<MapPin size={14} />} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Installation Status</label>
                            <div className="flex gap-4">
                                {['Yes', 'No'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isInstalled: opt })}
                                        className={`flex-1 py-3 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.isInstalled === opt ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-400 border-gray-200 hover:border-primary-600'}`}
                                    >
                                        {opt === 'Yes' ? 'Active' : 'Pending'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ReportInput label="Hardware Count (CCTV)" value={formData.cameraCount} onChange={v => setFormData({ ...formData, cameraCount: v })} placeholder="04 Units" type="number" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Anomalies / Field Notes</label>
                        <textarea
                            value={formData.issues}
                            onChange={e => setFormData({ ...formData, issues: e.target.value })}
                            rows="4"
                            className="w-full bg-gray-50 border border-gray-200 rounded p-4 text-sm focus:outline-none focus:border-primary-600 transition-all text-gray-600 placeholder:text-gray-300"
                            placeholder="Identify any hardware conflicts or security gaps detected during deployment..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Visual Evidence (Upload)</label>
                        <div className="relative border-2 border-dashed border-gray-100 rounded-xl p-10 text-center hover:border-primary-600 transition-all bg-gray-50/10 group">
                            <input
                                type="file"
                                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="mx-auto text-gray-200 mb-4 group-hover:text-primary-600 transition-colors" size={32} />
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                                {formData.image ? formData.image.name : 'Drag files here or click to browse'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest">
                            <Shield size={12} /> Encrypted Transmission
                        </div>
                        <button
                            type="submit"
                            disabled={loading || submitted}
                            className={`btn-teal px-12 py-3 flex items-center justify-center gap-3 transform active:scale-95 transition-all shadow-lg ${submitted ? 'bg-emerald-500 hover:bg-emerald-500' : 'shadow-primary-500/10'}`}
                        >
                            {loading ? <Upload className="animate-spin" size={18} /> :
                                submitted ? <><CheckCircle size={18} /> Transmitted</> :
                                    <><Send size={18} /> Transmit Report</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card-hr bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-primary-600" />
                        <h2 className="font-medium text-gray-700 italic">Historical <span className="not-italic">Transmissions</span></h2>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left bg-white border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Descriptor / Date</th>
                                <th className="px-8 py-4">Location Space</th>
                                <th className="px-8 py-4">Status Vector</th>
                                <th className="px-8 py-4 text-right">Deep Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports.length > 0 ? reports.map((report) => (
                                <tr key={report._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-primary-500 shadow-sm border border-gray-100">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{report.clientName}</p>
                                                <p className="text-[10px] text-gray-400 italic mt-0.5">
                                                    {new Date(report.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                            <MapPin size={12} className="text-primary-500" />
                                            {report.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                            ${report.isInstalled === 'Yes' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                            {report.isInstalled === 'Yes' ? 'Implemented' : 'Pending'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReport(report)}
                                            className="px-4 py-2 bg-white border border-gray-100 rounded text-[10px] font-bold text-primary-500 uppercase tracking-widest hover:bg-gray-50 hover:text-primary-600 transition-all flex items-center gap-2 ml-auto"
                                        >
                                            Inspect <ExternalLink size={14} />
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

            <div className="p-6 bg-primary-50 text-primary-800 rounded border border-primary-100 text-[10px] font-bold uppercase tracking-widest text-center leading-relaxed">
                By submitting this document, you certify that all information is accurate and verified per the Installation Compliance Act of 2026.
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
                            <div className="md:w-[55%] bg-slate-900 flex items-center justify-center p-12 relative group min-h-[400px]">
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Reporting Date</label>
                                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
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

const ReportInput = ({ label, value, onChange, placeholder, type = "text", icon }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600">{icon}</div>}
            <input
                required
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white border border-gray-200 rounded p-4 text-sm focus:outline-none focus:border-primary-600 transition-all text-gray-600 placeholder:text-gray-300 ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

export default ReportsPage;
