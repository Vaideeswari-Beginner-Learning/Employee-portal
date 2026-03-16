import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    ClipboardList, 
    UserPlus, 
    RefreshCcw, 
    Filter, 
    Search,
    ChevronRight,
    CheckCircle,
    Clock,
    User,
    MoreVertical,
    Layers,
    ShoppingCart
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminCXDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ products: 0, orders: 0, requests: 0, personnel: 0 });
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqRes, empRes, prodRes, orderRes] = await Promise.all([
                    api.get('shop/admin/installations'),
                    api.get('admin/employees'),
                    api.get('shop/products'),
                    api.get('shop/admin/orders')
                ]);
                setRequests(reqRes.data);
                const personnel = Array.isArray(empRes.data) ? empRes.data : [];
                setEmployees(personnel);
                setStats({
                    products: prodRes.data.length,
                    orders: orderRes.data.length,
                    requests: reqRes.data.length,
                    personnel: personnel.length
                });
            } catch (err) {
                console.error("Failed to fetch admin CX data:", err);
                toast.error("Resource Access Error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdate = async (id, data) => {
        try {
            await api.patch(`shop/admin/installations/${id}`, data);
            setRequests(requests.map(r => r._id === id ? { ...r, ...data } : r));
            toast.success("Protocol Updated");
        } catch (err) {
            toast.error("Update Failed");
        }
    };

    const statuses = ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

    const filteredRequests = filterStatus === 'All' 
        ? requests 
        : requests.filter(r => r.status === filterStatus);

    return (
        <div className="p-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-2 block">Enterprise Operations</span>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Service Management</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-100 rounded-2xl p-2 flex gap-1 overflow-x-auto max-w-[500px] no-scrollbar">
                        {['All', ...statuses].map(s => (
                            <button 
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'CCTV Inventory', val: stats.products, icon: Layers, color: 'text-sky-500', bg: 'bg-sky-50' },
                    { label: 'Total Orders', val: stats.orders, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Install Requests', val: stats.requests, icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Support Personnel', val: stats.personnel, icon: User, color: 'text-indigo-500', bg: 'bg-indigo-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-80 flex flex-col">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Installation Velocity</h3>
                    <div className="flex-1 flex items-end gap-3 px-4">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-sky-500/10 rounded-t-xl relative group">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-xl transition-all group-hover:bg-sky-600"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
                <div className="bg-slate-900 p-10 rounded-[3rem] h-80 flex flex-col text-white">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-white/40">Product Categories</h3>
                    <div className="flex-1 flex items-center justify-center gap-12">
                        <div className="w-32 h-32 rounded-full border-[12px] border-[#2563EB] border-t-white/10 border-r-white/20 relative">
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-black leading-none">100%</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Security</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { l: 'Dome', c: 'bg-white/20', p: '35%' },
                                { l: 'Bullet', c: 'bg-[#2563EB]', p: '45%' },
                                { l: 'Wireless', c: 'bg-[#22C55E]', p: '20%' }
                            ].map((cat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${cat.c}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{cat.l}</span>
                                    <span className="text-[10px] font-black ml-auto">{cat.p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue / Deployment</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Priority</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Personnel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 uppercase tracking-widest">
                                            {req.requestId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-900 mb-1">{req.customerName}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{req.phone}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-900 mb-1">{req.installationType} Setup</p>
                                        <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{req.location}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">Normal Protocol</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <select 
                                                value={req.status}
                                                onChange={(e) => handleUpdate(req._id, { status: e.target.value })}
                                                className={`text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 border outline-none appearance-none transition-all cursor-pointer ${
                                                    req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    req.status === 'In Progress' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                    req.status === 'Assigned' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <select 
                                            value={req.assignedTechnician?._id || req.assignedTechnician || ''}
                                            onChange={(e) => handleUpdate(req._id, { assignedTechnician: e.target.value })}
                                            className="bg-transparent text-[10px] font-black text-slate-500 uppercase tracking-tighter outline-none hover:text-sky-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">Pending Assignment</option>
                                            {employees.filter(e => e.role === 'employee' || e.role === 'admin' || e.role === 'manager').map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-slate-300 hover:text-slate-900 p-2">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCXDashboard;
