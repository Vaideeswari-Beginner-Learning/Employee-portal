import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    UserCheck, 
    Mail, 
    Phone,
    Calendar,
    MoreVertical
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Fetch only users with role 'customer'
                const res = await api.get('admin/employees'); // Need an endpoint for all users ideally
                const filtered = res.data.filter(u => u.role === 'customer');
                
                // For demo if filtered is empty
                if (filtered.length === 0) {
                    setCustomers([
                        { _id: '1', name: 'Alice Smith', email: 'alice@test.com', phone: '+1 234 567 890', createdAt: '2024-01-15' },
                        { _id: '2', name: 'Bob Johnson', email: 'bob@test.com', phone: '+1 987 654 321', createdAt: '2024-02-10' },
                        { _id: '3', name: 'Test Customer', email: 'customer@test.com', phone: '+1 000 000 000', createdAt: '2024-03-01' },
                    ]);
                } else {
                    setCustomers(filtered);
                }
            } catch (err) {
                toast.error("Resource Access Error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    return (
        <div className="p-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-2 block">Client Ecosystem</span>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Customer Registry</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Find client..."
                            className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-sky-500 transition-all w-64"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Vector</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers.map((cust) => (
                            <tr key={cust._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-xs">
                                            {cust.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{cust.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Client</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 space-y-1">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <Mail size={12} className="text-slate-300" /> {cust.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <Phone size={12} className="text-slate-300" /> {cust.phone || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                        <Calendar size={12} className="text-slate-300" /> {new Date(cust.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                                        Active Node
                                    </span>
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
    );
};

export default AdminCustomers;
