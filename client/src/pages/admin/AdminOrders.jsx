import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, 
    Search, 
    Eye, 
    Truck, 
    CheckCircle,
    Clock,
    MoreVertical
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('shop/admin/orders');
            setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`shop/admin/orders/${id}`, { status });
            toast.success("Order status updated");
            fetchOrders();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Shipped': return 'bg-sky-50 text-sky-600 border-sky-100';
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="p-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-2 block">Fulfillment Ops</span>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Product Orders</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search orders..."
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
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{order.orderId}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-black text-slate-700">{order.customer?.name || 'Guest'}</p>
                                    <p className="text-[10px] text-slate-400">{order.customer?.email}</p>
                                </td>
                                <td className="px-8 py-6 text-[11px] font-bold text-slate-400">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6 text-sm font-black text-slate-900 tabular-nums">
                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                </td>
                                <td className="px-8 py-6">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer ${getStatusStyle(order.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-slate-300 hover:text-slate-900 p-2 transition-colors">
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

export default AdminOrders;
