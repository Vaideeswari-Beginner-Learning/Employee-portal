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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('admin/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error('Employees fetch error:', err.response?.data || err.message);
        }
    };

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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight leading-none">Personnel<span className="text-primary-500 italic">.Registry</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">High-Resolution Human Capital Database</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-teal px-8 py-3.5 flex items-center justify-center gap-3"
                >
                    <UserPlus size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Onboard Personnel</span>
                </button>
            </div>

            <div className="card-premium flex flex-col bg-white/50 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-white/50">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 bg-white/30">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            placeholder="Search by name, ID or vector..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-500 hover:border-primary-100 hover:bg-primary-50/10 transition-all shadow-sm">
                            <Filter size={20} />
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                            Sort: Newest
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full sidebar-scroll">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Personnel Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Staff Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Department</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">Duty Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-primary-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-sm uppercase shadow-sm group-hover:scale-105 transition-transform">
                                                {(emp.name || emp.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{emp.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[11px] font-bold text-primary-500 uppercase tracking-tight">{emp.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-colors">
                                            #{emp.employeeId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">General Operations</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Permanent Cycle</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-primary-500 hover:border-primary-100 shadow-sm transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp._id)}
                                                className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
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
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/50"
                        >
                            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
                                <div>
                                    <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">
                                        {editingId ? 'Update' : 'Onboard'}<span className="text-primary-500">.Node</span>
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
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center group"
                                >
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ModalInput label="Operational Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Employee Name" icon={<User size={14} />} />
                                    <ModalInput label="Identity Code" value={formData.employeeId} onChange={v => setFormData({ ...formData, employeeId: v })} placeholder="e.g. EMP001" icon={<Hash size={14} />} />
                                    <div className="md:col-span-2">
                                        <ModalInput label="Communication Vector" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="employee@company.com" type="email" icon={<Mail size={14} />} />
                                    </div>
                                    <ModalInput label="Contact Node" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} placeholder="+91 XXXXX XXXXX" icon={<Phone size={14} />} />
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Shield size={14} /> Permission Level
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="employee">Field Employee</option>
                                            <option value="manager">Operations Manager</option>
                                            <option value="admin">System Admin</option>
                                        </select>
                                    </div>
                                    <ModalInput label="Security Key" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} placeholder="••••••••" type="password" icon={<Shield size={14} />} />

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
                                                            ? 'bg-primary-500 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <span>{emoji}</span>
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
                                        className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em]"
                                    >
                                        Abort Sync
                                    </button>
                                    <button type="submit" className="flex-1 py-4 text-[10px] font-black text-white bg-primary-500 shadow-xl shadow-primary-500/20 rounded-2xl hover:bg-primary-600 transition-all uppercase tracking-[0.2em] active:scale-95">
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
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-800 placeholder:text-slate-200 font-bold"
            />
        </div>
    </div>
);

export default EmployeeMgmt;
