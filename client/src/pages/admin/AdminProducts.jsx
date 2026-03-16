import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Package, 
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle
} from 'lucide-react';
import api, { getImageUrl } from '../../utils/api';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Dome Cameras',
        price: '',
        description: '',
        shortDescription: '',
        availability: true,
        images: { front: '', back: '', side: '' },
        technicalSpecs: []
    });

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('shop/admin/products');
            setProducts(res.data);
        } catch (err) {
            toast.error("Failed to load inventory");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.patch(`shop/admin/products/${editingProduct._id}`, formData);
                toast.success("Product Updated");
            } else {
                await api.post('shop/admin/products', formData);
                toast.success("Product Created");
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            toast.error("Operation Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await api.delete(`shop/admin/products/${id}`);
            toast.success("Product Purged");
            fetchProducts();
        } catch (err) {
            toast.error("Purge Failed");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-2 block">Inventory Management</span>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Product Catalog</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Find product..."
                            className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-sky-500 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <button 
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ name: '', category: 'Dome Cameras', price: '', description: '', shortDescription: '', availability: true, images: { front: '', back: '', side: '' }, technicalSpecs: [] });
                            setShowModal(true);
                        }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-sky-500 transition-all"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredProducts.map((product) => (
                            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                                            {product.images?.front ? (
                                                <img src={getImageUrl(product.images.front)} alt="" className="max-h-full object-contain" />
                                            ) : (
                                                <Package className="text-slate-200" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{product.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{product.shortDescription}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full">{product.category}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-black text-slate-900 tabular-nums">₹{product.price}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {product.availability ? (
                                            <><CheckCircle className="text-emerald-500" size={14} /> <span className="text-[10px] font-black text-emerald-600 uppercase">Available</span></>
                                        ) : (
                                            <><XCircle className="text-rose-500" size={14} /> <span className="text-[10px] font-black text-rose-600 uppercase">Out of Stock</span></>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setFormData(product);
                                                setShowModal(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
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

            {/* Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 italic">
                                {editingProduct ? 'Edit Product Record' : 'New CCTV Deployment'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Product Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="Dome Cameras">Dome Cameras</option>
                                            <option value="Bullet Cameras">Bullet Cameras</option>
                                            <option value="PTZ Cameras">PTZ Cameras</option>
                                            <option value="Wireless Cameras">Wireless Cameras</option>
                                            <option value="IP Cameras">IP Cameras</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Unit Price ($)</label>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Short Description</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Operational Description</label>
                                    <textarea 
                                        rows="4"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-6 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    {['front', 'back', 'side'].map(view => (
                                        <div key={view} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{view} Path</label>
                                            <input 
                                                type="text" 
                                                placeholder={`/uploads/${view}.png`}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-[10px] font-bold outline-none"
                                                value={formData.images[view]}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    images: { ...formData.images, [view]: e.target.value }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-50 text-slate-400 h-16 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-sky-500 text-white h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-sky-200 hover:bg-sky-600 transition-all"
                                    >
                                        {editingProduct ? 'Commit Changes' : 'Initialize Node'}
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

export default AdminProducts;
