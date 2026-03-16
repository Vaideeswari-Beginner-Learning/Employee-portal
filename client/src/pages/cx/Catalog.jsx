import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, Eye, X, Check, SlidersHorizontal, ChevronRight } from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api, { getImageUrl } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const PLACEHOLDER_IMGS = {
    'Dome Cameras': '/uploads/cctv_dome.png',
    'Bullet Cameras': '/uploads/cctv_bullet.png',
    'PTZ Cameras': '/uploads/cctv_ptz.png',
    'Wireless Cameras': '/uploads/cctv_node_hero.png',
    'IP Cameras': '/uploads/cctv_hero_main.png',
    'Accessories': '/uploads/futuristic_dashboard.png',
};

const categories = ['Dome Cameras', 'Bullet Cameras', 'PTZ Cameras', 'Wireless Cameras', 'IP Cameras', 'Accessories'];

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const searchParams = new URLSearchParams(location.search);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        maxPrice: '',
        nightVision: false,
        outdoor: false,
    });
    const [liveSearch, setLiveSearch] = useState(filters.search);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.category) params.append('category', filters.category);
                if (filters.search) params.append('search', filters.search);
                const res = await api.get(`shop/products?${params.toString()}`);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };
        const debounce = setTimeout(fetchProducts, 300);
        return () => clearTimeout(debounce);
    }, [filters]);

    // Update search filter from the live search box with debounce
    useEffect(() => {
        const t = setTimeout(() => setFilters(f => ({ ...f, search: liveSearch })), 400);
        return () => clearTimeout(t);
    }, [liveSearch]);

    const displayedProducts = products.filter(p => {
        if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
        return true;
    });

    const clearFilters = () => {
        setFilters({ category: '', search: '', maxPrice: '', nightVision: false, outdoor: false });
        setLiveSearch('');
    };

    const FilterPanel = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Filters</h3>
                <button onClick={clearFilters} className="text-[10px] mono-tech font-black text-slate-400 hover:text-[#0EA5E9] transition-colors tracking-widest uppercase">Clear All</button>
            </div>

            {/* Category */}
            <div className="space-y-4">
                <h4 className="mono-tech text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Camera Type</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => setFilters(f => ({ ...f, category: '' }))}
                        className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-black transition-all text-left ${!filters.category ? 'bg-[#0EA5E9] text-white shadow-lg shadow-sky-200' : 'text-slate-500 hover:bg-sky-50 hover:text-[#0EA5E9]'}`}
                    >
                        All Cameras
                        {!filters.category && <Check size={14} className="ml-auto" />}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-bold transition-all text-left ${filters.category === cat ? 'bg-[#0EA5E9] text-white shadow-lg shadow-sky-200' : 'text-slate-500 hover:bg-sky-50 hover:text-[#0EA5E9]'}`}
                        >
                            {cat}
                            {filters.category === cat && <Check size={14} className="ml-auto" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <h4 className="mono-tech text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Max Price (₹)</h4>
                <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    placeholder="e.g. 20000"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#0EA5E9] focus:bg-white transition-all"
                />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
                <h4 className="mono-tech text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Features</h4>
                {[
                    { key: 'nightVision', label: 'Night Vision' },
                    { key: 'outdoor', label: 'Outdoor Ready' }
                ].map(f => (
                    <label key={f.key} className="flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-sky-100 cursor-pointer transition-all">
                        <span className="text-sm font-bold text-slate-600">{f.label}</span>
                        <div
                            onClick={() => setFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${filters[f.key] ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${filters[f.key] ? 'left-7' : 'left-1'}`} />
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <CXNavbar />

            <main className="max-w-[1600px] mx-auto px-8 pt-32 pb-20">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-xs mono-tech text-slate-400 mb-4 uppercase tracking-widest">
                        <Link to="/home" className="hover:text-[#0EA5E9] transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 font-black">Security Catalog</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">ALL <span className="text-[#0EA5E9]">CAMERAS</span></h1>
                            <p className="text-slate-500 text-sm mt-2">{displayedProducts.length} nodes available</p>
                        </div>
                        {/* Search bar */}
                        <div className="flex gap-4 items-center">
                            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 items-center gap-3 w-80 focus-within:border-[#0EA5E9] focus-within:bg-white transition-all">
                                <Search size={18} className="text-slate-300 shrink-0" />
                                <input
                                    value={liveSearch}
                                    onChange={e => setLiveSearch(e.target.value)}
                                    placeholder="Search cameras..."
                                    className="bg-transparent w-full text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                                />
                                {liveSearch && <button onClick={() => { setLiveSearch(''); }} className="text-slate-300 hover:text-slate-600"><X size={16} /></button>}
                            </div>
                            <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="lg:hidden p-3 bg-slate-900 text-white rounded-2xl">
                                <SlidersHorizontal size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-32 p-8 bg-slate-50 rounded-[40px] border border-sky-50">
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    <AnimatePresence>
                        {isMobileFilterOpen && (
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                className="fixed inset-0 z-50 bg-white p-8 lg:hidden overflow-y-auto"
                            >
                                <div className="flex justify-between mb-8">
                                    <h2 className="text-2xl font-black">Filters</h2>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2"><X size={24} /></button>
                                </div>
                                <FilterPanel />
                                <button onClick={() => setIsMobileFilterOpen(false)} className="w-full mt-8 py-5 bg-[#0EA5E9] text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                                    Apply Filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-slate-50 rounded-[32px] animate-pulse" />)}
                            </div>
                        ) : displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {displayedProducts.map((product, i) => (
                                        <motion.div
                                            key={product._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.04 }}
                                            whileHover={{ y: -6 }}
                                            className="bg-white rounded-[32px] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-sky-100/30 transition-all duration-500 flex flex-col"
                                        >
                                            <Link to={`/product/${product._id}`} className="block relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-8">
                                                <div className="scan-line hidden group-hover:block" />
                                                <div className="absolute top-5 left-5 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-[8px] font-black text-[#0EA5E9] mono-tech border border-sky-50 z-10">
                                                    NODE_{product._id?.slice(-4)?.toUpperCase()}
                                                </div>
                                                {/* HUD corners */}
                                                <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#0EA5E9]/20 rounded-tr-2xl" />
                                                <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#0EA5E9]/20 rounded-bl-2xl" />
                                                <img 
                                                    src={product.images?.front ? getImageUrl(product.images.front) : getImageUrl(PLACEHOLDER_IMGS[product.category] || '/uploads/cctv_dome.png')}
                                                    alt={product.name}
                                                    className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700 z-10 relative"
                                                />
                                            </Link>
                                            <div className="p-7 flex flex-col flex-1 border-t border-slate-50">
                                                <p className="text-[9px] mono-tech font-black text-[#0EA5E9] tracking-[0.3em] uppercase mb-2">{product.category}</p>
                                                <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight mb-2 hover:text-[#0EA5E9] transition-colors">
                                                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                                                </h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill={idx < Math.floor(product.ratings || 4) ? '#F59E0B' : 'none'} className={idx < Math.floor(product.ratings || 4) ? 'text-amber-400' : 'text-slate-200'} />)}
                                                    </div>
                                                    <span className="text-xs text-[#0EA5E9] font-bold">{product.ratings || 4.5}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs leading-relaxed mb-5 line-clamp-2 flex-1">{product.shortDescription}</p>
                                                <div className="flex items-center justify-between mt-auto gap-4">
                                                    <span className="text-2xl font-black text-slate-900">₹{product.price?.toLocaleString()}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { addToCart(product, 1); toast.success("Added to cart!"); }}
                                                            className="p-3 bg-slate-900 hover:bg-[#0EA5E9] text-white rounded-2xl transition-all active:scale-95"
                                                        >
                                                            <ShoppingCart size={16} />
                                                        </button>
                                                        <Link to={`/product/${product._id}`} className="p-3 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] rounded-2xl transition-all">
                                                            <Eye size={16} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                                    <Search size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">No cameras found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
                                <button onClick={clearFilters} className="px-10 py-4 bg-[#0EA5E9] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-sky-200 transition-all active:scale-95">
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <CXFooter />
        </div>
    );
};

export default Catalog;
