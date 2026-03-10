import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, X, Building2, Flag, Gift, CheckCircle, AlertCircle } from 'lucide-react';

const HOLIDAY_TYPES = [
    { value: 'government', label: 'Government Holiday', icon: Flag, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'company', label: 'Company Holiday', icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700 border-sky-200' },
    { value: 'optional', label: 'Optional Holiday', icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const HolidayManager = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', type: 'government', description: '' });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await api.get('admin/holidays');
            setHolidays(res.data);
        } catch (err) {
            showNotif('error', 'Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    const showNotif = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('admin/holidays', form);
            setHolidays(prev => [...prev, res.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setForm({ title: '', date: '', type: 'government', description: '' });
            setShowForm(false);
            showNotif('success', 'Holiday added successfully');
        } catch (err) {
            showNotif('error', 'Failed to add holiday');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this holiday?')) return;
        try {
            await api.delete(`admin/holidays/${id}`);
            setHolidays(prev => prev.filter(h => h._id !== id));
            showNotif('success', 'Holiday removed');
        } catch (err) {
            showNotif('error', 'Delete failed');
        }
    };

    const grouped = holidays.reduce((acc, h) => {
        const year = new Date(h.date).getFullYear();
        const month = new Date(h.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(h);
        return acc;
    }, {});

    const getTypeInfo = (type) => HOLIDAY_TYPES.find(t => t.value === type) || HOLIDAY_TYPES[0];

    return (
        <div className="space-y-8 pb-20">
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[300]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {notification.msg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Holiday Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] shadow-2xl border border-sky-100 w-full max-w-lg overflow-hidden"
                        >
                            <div className="h-20 bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-between px-8">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Add Holiday</h2>
                                <button onClick={() => setShowForm(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAdd} className="p-8 space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Holiday Name</label>
                                    <input
                                        required type="text" value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Republic Day"
                                        className="w-full p-4 bg-sky-50 border border-sky-200 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date</label>
                                    <input
                                        required type="date" value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full p-4 bg-sky-50 border border-sky-200 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {HOLIDAY_TYPES.map(t => (
                                            <button
                                                key={t.value} type="button"
                                                onClick={() => setForm({ ...form, type: t.value })}
                                                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-wide ${form.type === t.value ? `${t.bg} ${t.border} ${t.color}` : 'border-slate-100 text-slate-400 hover:border-sky-200'}`}
                                            >
                                                <t.icon size={18} />
                                                {t.label.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description (Optional)</label>
                                    <input
                                        type="text" value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief description..."
                                        className="w-full p-4 bg-sky-50 border border-sky-200 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-300/40 hover:from-sky-600 hover:to-blue-700 transition-all active:scale-95">
                                    Add Holiday
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">
                        Holiday <span className="text-sky-500 italic">.Registry</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">
                        Manage company and government holidays — visible to all employees
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-300/40 hover:from-sky-600 hover:to-blue-700 transition-all"
                >
                    <Plus size={18} /> Add Holiday
                </motion.button>
            </div>

            {/* Summary badges */}
            <div className="grid grid-cols-3 gap-4">
                {HOLIDAY_TYPES.map(t => {
                    const count = holidays.filter(h => h.type === t.value).length;
                    return (
                        <div key={t.value} className={`p-5 rounded-2xl border ${t.bg} ${t.border} flex items-center gap-4`}>
                            <div className={`p-3 rounded-xl ${t.color} bg-white shadow-sm`}>
                                <t.icon size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{count}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${t.color}`}>{t.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Holiday list grouped by month */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin" />
                </div>
            ) : holidays.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-sky-100">
                    <Calendar size={48} className="mx-auto text-sky-200 mb-4" />
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No holidays added yet</p>
                    <p className="text-slate-300 text-xs mt-2">Click "Add Holiday" to add government or company holidays</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([month, items]) => (
                        <div key={month} className="bg-white rounded-[2rem] border border-sky-100 overflow-hidden shadow-sm">
                            <div className="px-8 py-4 bg-sky-50 border-b border-sky-100">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{month}</p>
                            </div>
                            <div className="divide-y divide-sky-50">
                                {items.map((h, i) => {
                                    const typeInfo = getTypeInfo(h.type);
                                    const d = new Date(h.date);
                                    return (
                                        <motion.div
                                            key={h._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-6 hover:bg-sky-50/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl ${typeInfo.bg} ${typeInfo.border} border flex flex-col items-center justify-center shadow-sm`}>
                                                    <span className={`text-lg font-black leading-none ${typeInfo.color}`}>{d.getDate()}</span>
                                                    <span className={`text-[9px] font-black uppercase ${typeInfo.color}`}>{d.toLocaleString('default', { weekday: 'short' })}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{h.title}</p>
                                                    {h.description && <p className="text-[11px] text-slate-400 mt-0.5">{h.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${typeInfo.badge}`}>
                                                    {h.type}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(h._id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HolidayManager;
