import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Edit2, Search, Filter, Mail, Phone, Hash, X, Shield, MoreHorizontal, User } from 'lucide-react';
import api from '../../utils/api';

const EmployeeMgmt = () => {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', employeeId: '', role: 'employee', expertise: []
    });

    const fetchEmployees = async () => {
        try {
            const res = await api.get('admin/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error('Employees fetch error:', err.response?.data || err.message);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchEmployees();
        };
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`admin/employees/${editingId}`, formData);
            } else {
                await api.post('admin/employees', formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', email: '', password: '', phone: '', employeeId: '', role: 'employee', expertise: [] });
            fetchEmployees();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Personnel synchronization error: ' + msg);
        }
    };

    const handleEdit = (emp) => {
        setEditingId(emp._id);
        setFormData({
            name: emp.name,
            email: emp.email,
            phone: emp.phone || '',
            employeeId: emp.employeeId,
            role: emp.role || 'employee',
            expertise: emp.expertise || [],
            password: '' // Keep empty for security, only change if user types
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('PERMANENT DELETION: Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`admin/employees/${id}`);
            fetchEmployees();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Deletion failed: ' + msg);
        }
    };


    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 p-4 sm:p-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-xl sm:text-3xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">Personnel<span className="text-sky-500 italic">.Registry</span></h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-2 sm:mt-3">High-Resolution Human Capital Database</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto bg-sky-500 hover:bg-sky-700 text-slate-800 px-8 py-3.5 flex items-center justify-center gap-3 rounded-2xl shadow-lg shadow-sky-600/20 transition-all font-bold active:scale-95"
                >
                    <UserPlus size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Onboard Personnel</span>
                </button>
            </div>

            <div className="card-premium flex flex-col overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-sky-100 flex flex-col md:flex-row items-center gap-4 sm:gap-6 bg-sky-50">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Search by name, ID or vector..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-sky-50/50 border border-sky-100 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-6 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 placeholder:text-slate-400 shadow-inner font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none p-3 sm:p-3.5 bg-sky-50 border border-sky-100 rounded-xl sm:rounded-2xl text-slate-400 hover:text-sky-500 hover:border-sky-500/50 transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                        <button className="flex-1 md:flex-none px-4 sm:px-6 py-3 sm:py-3.5 bg-sky-50 border border-sky-100 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all">
                            Sort: Newest
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-sky-50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Personnel Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Staff Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Department</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100">Duty Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-sky-100 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-sky-50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center font-black text-slate-400 text-sm uppercase shadow-sm group-hover:scale-105 transition-transform">
                                                {(emp.name || emp.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-700 leading-none mb-1.5 uppercase">{emp.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{emp.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-sky-50 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-widest border border-sky-100 group-hover:bg-sky-500 group-hover:text-slate-800 group-hover:border-sky-700 transition-colors">
                                            #{emp.employeeId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">General Operations</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Cycle</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-slate-400 hover:text-sky-500 hover:border-sky-500/30 shadow-sm transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp._id)}
                                                className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/30 shadow-sm transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-sky-50/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-sky-50 rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden border border-sky-100"
                        >
                            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-sky-100 flex justify-between items-center bg-sky-50">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-display font-black text-slate-800 tracking-tight uppercase">
                                        {editingId ? 'Update' : 'Onboard'}<span className="text-sky-500">.Node</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {editingId ? 'Personnel Identity Modification' : 'Personnel Registry Initialization'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                        setFormData({ name: '', email: '', password: '', phone: '', employeeId: '', expertise: [] });
                                    }}
                                    className="w-12 h-12 rounded-2xl bg-sky-50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center group border border-sky-100"
                                >
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8 max-h-[85vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ModalInput label="Operational Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Employee Name" icon={<User size={14} />} />
                                    <ModalInput label="Identity Code" value={formData.employeeId} onChange={v => setFormData({ ...formData, employeeId: v })} placeholder="e.g. EMP001" icon={<Hash size={14} />} />
                                    <ModalInput label="Communication Vector" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="employee@company.com" type="email" icon={<Mail size={14} />} />
                                    <ModalInput label="Contact Node" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} placeholder="+91 XXXXX XXXXX" icon={<Phone size={14} />} />
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Shield size={14} /> Permission Level
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-sky-50 border border-sky-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="employee">Field Employee</option>
                                            <option value="manager">Operations Manager</option>
                                            <option value="admin">System Admin</option>
                                        </select>
                                    </div>
                                    <ModalInput label="Security Key" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" type="password" icon={<Shield size={14} />} />

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            Expertise & Skills
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { skill: 'Installation', emoji: '' },
                                                { skill: 'Maintenance', emoji: '' },
                                                { skill: 'Service', emoji: '' },
                                                { skill: 'Inspection', emoji: '' }
                                            ].map(({ skill, emoji }) => {
                                                const isSelected = formData.expertise.includes(skill);
                                                return (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => {
                                                            const newExpertise = isSelected
                                                                ? formData.expertise.filter(s => s !== skill)
                                                                : [...formData.expertise, skill];
                                                            setFormData({ ...formData, expertise: newExpertise });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${isSelected
                                                            ? 'bg-sky-500 text-slate-800 border-sky-700 shadow-lg shadow-sky-600/20'
                                                            : 'bg-sky-50 text-slate-400 border-sky-100 hover:bg-sky-100'
                                                            }`}
                                                    >
                                                        {skill}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingId(null);
                                            setFormData({ name: '', email: '', password: '', phone: '', employeeId: '', expertise: [] });
                                        }}
                                        type="button"
                                        className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-sky-50 border border-sky-100 rounded-2xl hover:bg-sky-100 transition-all uppercase tracking-[0.2em]"
                                    >
                                        Abort Sync
                                    </button>
                                    <button type="submit" className="flex-1 py-4 text-[10px] font-black text-slate-800 bg-sky-500 shadow-xl shadow-sky-600/20 rounded-2xl hover:bg-sky-700 transition-all uppercase tracking-[0.2em] active:scale-95">
                                        {editingId ? 'Save Changes' : 'Finalize Onboarding'}
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

const ModalInput = ({ label, value, onChange, placeholder, icon, type = "text" }) => (
    <div className="space-y-2.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        <div className="relative group">
            <input
                required={type !== 'password'}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-sky-50 border border-sky-100 rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-sky-50 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 placeholder:text-slate-500 font-bold"
            />
        </div>
    </div>
);

export default EmployeeMgmt;


