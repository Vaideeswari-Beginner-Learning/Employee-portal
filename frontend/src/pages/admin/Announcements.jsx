import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Clock, User, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Announcements = () => {
    const { user } = useAuth();
    const isAdmin = user?.email === 'admin@cctv.com';
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium' });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const showNotify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/announcements', formData);
            showNotify('success', 'Announcement transmitted successfully.');
            setShowModal(false);
            setFormData({ title: '', content: '', priority: 'medium' });
            fetchAnnouncements();
        } catch (err) {
            showNotify('error', 'Transmission failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this broadcast?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showNotify('success', 'Broadcast terminated.');
            fetchAnnouncements();
        } catch (err) {
            showNotify('error', 'Termination failed.');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
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

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">Broadcast<span className="text-primary-500 italic">.Control</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Global Infrastructure Communications</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-teal px-8 py-4 flex items-center gap-3"
                    >
                        <Plus size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">New Broadcast</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center bg-white/50 rounded-[2rem] border border-slate-100">
                        <Loader2 className="animate-spin text-primary-500 mb-4" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Communication Channels...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card-premium p-8 group hover:border-primary-100 transition-all flex flex-col md:flex-row gap-8 items-start justify-between"
                        >
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : item.priority === 'medium' ? 'bg-primary-50 text-primary-500 border-primary-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                        {item.priority} Priority
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter flex items-center gap-2">
                                        <Clock size={12} /> {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-display font-black text-slate-800 tracking-tight leading-none">{item.title}</h2>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.content}</p>
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                        {item.author?.name?.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node: {item.author?.name}</span>
                                </div>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-4 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="py-32 text-center flex flex-col items-center justify-center bg-white/50 rounded-[2rem] border border-white/50 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
                            <Megaphone size={40} />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Static detected. Zero active broadcasts.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden border border-white/20"
                        >
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight leading-none">Initialize <span className="text-primary-500">Broadcast</span></h2>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Network Layer Broadcast Registry</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Broadcast Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 transition-all outline-none text-slate-700"
                                            placeholder="Emergency Server Maintenance..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Priority Protocol</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['low', 'medium', 'high'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: p })}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.priority === p ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary-100'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transmission Content</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 transition-all outline-none text-slate-700 resize-none"
                                            placeholder="Detailed transmission data goes here..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-5 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Megaphone size={18} />}
                                        Initialize Transmission
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="sm:w-1/3 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all outline-none"
                                    >
                                        Abort
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

export default Announcements;
