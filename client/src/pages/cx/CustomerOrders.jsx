import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight, XCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import { useAuth } from '../../context/AuthContext';
import api, { getImageUrl } from '../../utils/api';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, setIsLoginModalOpen, setRedirectUrl } = useAuth();

    useEffect(() => {
        if (!user && !isLoading) {
            setRedirectUrl('/orders');
            setIsLoginModalOpen(true);
        }
    }, [user, isLoading, setIsLoginModalOpen, setRedirectUrl]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('shop/orders');
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        const statusColors = {
            'Pending': 'text-amber-600',
            'Processing': 'text-blue-600',
            'Shipped': 'text-purple-600',
            'Delivered': 'text-green-600',
            'Cancelled': 'text-red-600'
        };
        return statusColors[status] || 'text-slate-600';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <CXNavbar />
            
            <main className="max-w-5xl mx-auto px-4 pt-32 pb-20">
                {/* Breadcrumb Header */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
                    <Link to="/home" className="hover:text-[#2563EB]">Your Account</Link>
                    <ChevronRight size={14} />
                    <span className="text-[#c2410c]">Your Orders</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
                    
                    {/* Orders Search */}
                    <div className="relative w-full md:w-96 group">
                        <input 
                            type="text" 
                            placeholder="Search all orders"
                            className="w-full bg-white border border-slate-300 rounded-md py-2 pl-10 pr-4 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all shadow-sm group-hover:shadow-md"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB]" />
                        <button className="absolute right-0 top-0 bottom-0 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 rounded-r-md transition-colors">
                            Search Orders
                        </button>
                    </div>
                </div>

                {/* Filters Tab */}
                <div className="flex gap-6 border-b border-slate-200 mb-8 text-sm">
                    <button className="font-bold text-slate-900 border-b-2 border-[#c2410c] pb-2 px-1">Orders</button>
                    <button className="text-[#2563EB] hover:text-red-700 hover:underline pb-2 px-1">Buy Again</button>
                    <button className="text-[#2563EB] hover:text-red-700 hover:underline pb-2 px-1">Not Yet Shipped</button>
                    <button className="text-[#2563EB] hover:text-red-700 hover:underline pb-2 px-1 hidden sm:block">Cancelled Orders</button>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="border border-slate-200 rounded-lg p-6 animate-pulse">
                                <div className="h-4 bg-slate-200 w-1/4 mb-4 rounded"></div>
                                <div className="h-24 bg-slate-100 w-full rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-sm">
                        <Package size={64} className="text-slate-200 mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">You haven't placed any orders yet.</h3>
                        <p className="text-slate-500 mb-6">Browse our catalog to find cameras to protect your property.</p>
                        <Link to="/catalog" className="bg-[#facc15] hover:bg-[#eab308] text-slate-900 font-bold px-8 py-3 rounded-full transition-colors shadow-sm">
                            Browse Security Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={order._id} 
                                className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
                            >
                                {/* Order Header Details */}
                                <div className="bg-slate-100 px-6 py-4 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-600 border-b border-slate-200">
                                    <div className="flex flex-col">
                                        <span className="font-semibold uppercase text-xs mb-1">Order Placed</span>
                                        <span className="text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold uppercase text-xs mb-1">Total</span>
                                        <span className="text-slate-700 font-bold tracking-tight">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold uppercase text-xs mb-1">Ship To</span>
                                        <span className="text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1">
                                            {order.customer?.name || 'Customer'} <ChevronDown size={14} />
                                        </span>
                                    </div>
                                    <div className="flex flex-col md:ml-auto md:text-right">
                                        <span className="font-semibold uppercase text-xs mb-1">Order # {order._id.substring(0, 8).toUpperCase()}-{order._id.substring(8, 16).toUpperCase()}</span>
                                        <div className="flex gap-3 text-[#2563EB]">
                                            <span className="hover:underline cursor-pointer">View order details</span>
                                            <div className="w-px bg-slate-300 h-4 mt-0.5"></div>
                                            <span className="hover:underline cursor-pointer">Invoice</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items and Actions */}
                                <div className="p-6">
                                    <h3 className={`text-lg font-bold capitalize mb-4 ${getStatusColor(order.status)} flex items-center gap-2`}>
                                        {order.status === 'Delivered' && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
                                        {order.status}
                                    </h3>
                                    
                                    {order.products.map(item => (
                                        <div key={item._id} className="flex flex-col sm:flex-row gap-6 mb-6 last:mb-0">
                                            <div className="w-24 h-24 bg-white border border-slate-100 rounded-md p-2 flex items-center justify-center shrink-0">
                                                {item.product?.images?.front || item.product?.images?.[0] ? (
                                                    <img src={getImageUrl(item.product.images.front || item.product.images[0])} alt={item.product?.name} className="max-h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <Package size={32} className="text-slate-300" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <Link to={`/product/${item.product?._id}`} className="text-sm font-semibold text-[#0ea5e9] hover:underline hover:text-red-700 line-clamp-2 mb-1">
                                                    {item.product?.name || 'Security Camera Product'}
                                                </Link>
                                                <p className="text-xs text-slate-500 mb-2">Return window closed on {new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                                <div className="flex gap-2">
                                                    <button className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded shadow-sm">Return or replace items</button>
                                                    <button className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded shadow-sm">Share gift receipt</button>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col gap-2 w-48 shrink-0">
                                                <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm py-1.5 px-3 rounded shadow-sm w-full text-center">Track package</button>
                                                <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm py-1.5 px-3 rounded shadow-sm w-full text-center">View your item</button>
                                                <Link to="/booking" className="bg-[#facc15] hover:bg-[#eab308] border border-[#facc15] hover:border-[#eab308] text-slate-900 font-semibold text-sm py-1.5 px-3 rounded shadow-sm w-full text-center">Request Installation</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// End of component

export default CustomerOrders;
