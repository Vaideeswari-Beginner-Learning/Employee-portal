import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, ShoppingCart, ShieldCheck, Zap, Star,
    Truck, RotateCcw, Check, Eye, Radio, Activity, Wrench, Plus, Minus, MessageCircle, User
} from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api, { getImageUrl } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const PLACEHOLDER_IMGS = {
    'Dome Cameras': 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=600',
    'Bullet Cameras': 'https://images.unsplash.com/photo-1582139329536-e72e88a0026e?auto=format&fit=crop&q=80&w=600',
    'PTZ Cameras': 'https://images.unsplash.com/photo-1559828913-9118c7c9ec92?auto=format&fit=crop&q=80&w=600',
    'Wireless Cameras': 'https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?auto=format&fit=crop&q=80&w=600',
    'IP Cameras': 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=600',
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [withInstall, setWithInstall] = useState(false);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`shop/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, qty);
        toast.success(withInstall ? `Added ${qty}x with installation!` : `Added ${qty}x to cart!`);
    };

    const handleBuyNow = () => {
        addToCart(product, 1);
        navigate('/cart');
    };

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-sky-100 border-t-[#0EA5E9] rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800 p-8 text-center">
            <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-8 border border-sky-100">
                <Eye size={40} className="text-[#0EA5E9] opacity-20" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">Node Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-md font-medium leading-relaxed">
                The product node you are looking for may have been updated or moved. 
                Please return to the catalog to view the latest active inventory.
            </p>
            <Link to="/catalog" className="px-10 py-4 bg-[#0EA5E9] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-sky-100 transition-all active:scale-95 hover:bg-sky-600">
                Refresh Catalog Inventory
            </Link>
        </div>
    );

    // Prepare image entries with labels
    const imageEntries = product.images 
        ? Object.entries(product.images)
            .filter(([_, value]) => Boolean(value))
            .map(([key, value]) => ({
                id: key,
                label: key.replace(/([A-Z])/g, ' $1').trim().toUpperCase() + ' VIEW',
                src: value
            }))
        : [];

    const fallback = PLACEHOLDER_IMGS[product.category] || 'https://via.placeholder.com/600';
    const displayImages = imageEntries.length 
        ? imageEntries 
        : [{ id: 'main', label: 'PRODUCT VIEW', src: fallback }];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <CXNavbar />

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-20">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs mono-tech text-slate-400 mb-12 uppercase tracking-widest">
                    <Link to="/home" className="hover:text-[#0EA5E9] transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/catalog" className="hover:text-[#0EA5E9] transition-colors">Catalog</Link>
                    <ChevronRight size={12} />
                    <span className="text-slate-900 font-black truncate max-w-xs">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Left: Image Gallery (Flipkart Style) */}
                    <div className="w-full lg:w-[500px] shrink-0 flex flex-col-reverse lg:flex-row gap-4 h-max">
                        {/* Thumbnails Rail */}
                        {displayImages.length > 1 && (
                            <div className="flex lg:flex-col gap-3 h-full overflow-x-auto lg:overflow-y-auto lg:h-[500px] no-scrollbar shrink-0 w-full lg:w-20">
                                {displayImages.map((img, index) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(index)}
                                        onMouseEnter={() => setActiveImage(index)}
                                        className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 border-2 rounded-2xl overflow-hidden p-2 transition-all duration-300 ${activeImage === index ? 'border-[#0EA5E9] bg-sky-50 shadow-md ring-2 ring-sky-100' : 'border-slate-100 hover:border-sky-300 bg-slate-50 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img.src) || img.src} className="w-full h-full object-contain" alt={`View ${img.id}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Stage */}
                        <div className="flex-1 relative group aspect-square lg:aspect-[4/5] bg-slate-50 rounded-[40px] border border-sky-50 overflow-hidden flex items-center justify-center p-12 shadow-2xl shadow-sky-50/50">
                            <div className="scan-line hidden group-hover:block" />
                            
                            {/* Metadata Badge */}
                            <div className="absolute top-6 left-6 flex flex-col gap-1 z-20">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[8px] font-black text-[#0EA5E9] mono-tech border border-sky-100 shadow-sm uppercase tracking-widest">
                                    {displayImages[activeImage].label}
                                </span>
                                <span className="px-3 py-1 bg-slate-900/5 backdrop-blur rounded-full text-[7px] font-black text-slate-400 mono-tech border border-slate-200/50 w-max">
                                    NODE_{product._id?.slice(-4)?.toUpperCase()}
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    src={getImageUrl(displayImages[activeImage].src) || displayImages[activeImage].src}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 z-10 relative cursor-crosshair"
                                />
                            </AnimatePresence>

                            {/* Corner HUD elements for that "tech" feel */}
                            <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-sky-100 rounded-tr-[24px]" />
                            <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-sky-100 rounded-bl-[24px]" />
                        </div>
                    </div>

                    {/* Middle: Product Info */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            <div>
                                <p className="mono-tech text-[9px] font-black text-[#0EA5E9] tracking-[0.4em] uppercase mb-3">{product.category}</p>
                                <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight tracking-tight">{product.name}</h1>

                                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-800">{product.ratings || 4.5}</span>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star key={idx} size={16} fill={idx < Math.floor(product.ratings || 4) ? '#F59E0B' : 'none'} className={idx < Math.floor(product.ratings || 4) ? 'text-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-[#0EA5E9] hover:underline cursor-pointer font-bold">124 ratings</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <div className="flex items-start gap-1 mb-1">
                                    <span className="text-lg font-bold text-slate-400 mt-2">₹</span>
                                    <span className="text-5xl font-black text-slate-900">{product.price.toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-sm text-slate-400">Inclusive of all taxes. Free delivery available.</p>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="font-black text-slate-900 mb-4 text-lg">About this item</h3>
                                <ul className="space-y-3">
                                    {[
                                        product.shortDescription || 'High-definition video surveillance.',
                                        ...(product.technicalSpecs || []).slice(0, 3).map(s => `${s.label}: ${s.value}`),
                                        `Covered by ${product.warranty || '1 Year'} manufacturer warranty.`
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-5 h-5 bg-sky-50 text-[#0EA5E9] rounded-lg flex items-center justify-center shrink-0 border border-sky-100">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Technical Specs Table */}
                            {product.technicalSpecs?.length > 0 && (
                                <div>
                                    <h3 className="font-black text-slate-900 mb-4 text-lg">Technical Specifications</h3>
                                    <div className="rounded-[24px] overflow-hidden border border-sky-50">
                                        {product.technicalSpecs.map((spec, i) => (
                                            <div key={i} className={`flex items-center gap-6 px-6 py-4 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                                <span className="mono-tech text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 shrink-0">{spec.label}</span>
                                                <span className="text-sm font-bold text-slate-800">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buy Box */}
                        <div className="w-full lg:w-72 shrink-0">
                            <div className="border border-sky-100 rounded-[40px] p-8 bg-white shadow-2xl shadow-sky-50 sticky top-32 space-y-6">
                                <div className="text-3xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}
                                    {withInstall && <span className="text-base text-slate-400 ml-2 font-bold">+ ₹999 install</span>}
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-green-600 font-bold">
                                    <Check size={18} />In Stock
                                </div>
                                <p className="text-xs text-slate-500">Shipped by <span className="font-bold text-[#0EA5E9]">SK Technology India</span></p>

                                {/* Quantity Selector */}
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Quantity</label>
                                    <div className="flex items-center gap-0 border border-slate-200 rounded-2xl overflow-hidden w-max">
                                        <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-5 py-3 hover:bg-sky-50 text-slate-600 transition-all">
                                            <Minus size={16} />
                                        </button>
                                        <span className="px-6 py-3 font-black text-slate-900 border-x border-slate-200 text-sm">{qty}</span>
                                        <button onClick={() => setQty(q => q+1)} className="px-5 py-3 hover:bg-sky-50 text-slate-600 transition-all">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Installation Add-on */}
                                <label className="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 cursor-pointer group hover:border-[#0EA5E9] transition-all">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${withInstall ? 'bg-[#0EA5E9] border-[#0EA5E9]' : 'border-slate-200 bg-white'}`} onClick={() => setWithInstall(!withInstall)}>
                                        {withInstall && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800">+ Add Professional Installation</p>
                                        <p className="text-[10px] text-slate-500">Certified installer visits your site • ₹999 extra</p>
                                    </div>
                                </label>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-[#facc15] hover:bg-amber-400 text-slate-900 py-4 rounded-2xl font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <ShoppingCart size={18} /> Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full bg-[#0EA5E9] hover:bg-sky-600 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Zap size={18} /> Buy Now
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                                    {[
                                        { icon: <Truck size={18} />, label: 'Free Delivery' },
                                        { icon: <RotateCcw size={18} />, label: '7 Day Return' },
                                        { icon: <ShieldCheck size={18} />, label: `${product.warranty || '1 Yr'} Warranty` },
                                    ].map((b, i) => (
                                        <div key={i} className="flex flex-col items-center text-center gap-2 group">
                                            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center border border-sky-100 group-hover:bg-[#0EA5E9] group-hover:text-white transition-all">
                                                {b.icon}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500 leading-tight">{b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ——— PRODUCT TABS ——— */}
                <div className="mt-20 pt-8 border-t border-slate-100">

                    {/* Tab Bar */}
                    <div className="flex gap-1 border-b border-slate-100 mb-10">
                        {[{id:'description', label:'Description'}, {id:'specifications', label:'Specifications'}, {id:'reviews', label:'Reviews (12)'}].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-4 font-black text-sm uppercase tracking-wider transition-all border-b-2 -mb-px ${
                                    activeTab === tab.id
                                        ? 'border-[#0EA5E9] text-[#0EA5E9]'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Description Tab */}
                    {activeTab === 'description' && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-3xl space-y-6">
                            <h2 className="text-2xl font-black text-slate-900">About This Camera</h2>
                            <p className="text-slate-600 leading-relaxed text-base">{product.description}</p>
                            <p className="text-slate-600 leading-relaxed">Enhance the safety of your premises with this state-of-the-art surveillance equipment. Specifically designed for round-the-clock monitoring, our cameras provide crystal-clear high-resolution imagery in all conditions — day or night.</p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {[
                                    '4K Ultra HD Resolution', 'Night Vision up to 30m',
                                    'IP67 Weatherproof Rating', 'Mobile App Real-time Access',
                                    'Motion Detection Alerts', 'Cloud & SD Card Storage'
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                        <div className="w-7 h-7 bg-[#0EA5E9] rounded-xl flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 'specifications' && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-3xl">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Technical Specifications</h2>
                            <div className="rounded-[24px] overflow-hidden border border-slate-100">
                                {[
                                    ...(product.technicalSpecs || []),
                                    { label: 'Brand', value: product.brand || 'SmartSecure Pro' },
                                    { label: 'Category', value: product.category },
                                    { label: 'Availability', value: product.availability ? 'In Stock' : 'Out of Stock' },
                                    { label: 'Warranty', value: product.warranty || '1 Year Manufacturer Warranty' },
                                ].map((spec, i) => (
                                    <div key={i} className={`flex items-center px-8 py-5 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                        <span className="mono-tech text-[10px] font-black text-slate-400 uppercase tracking-widest w-48 shrink-0">{spec.label}</span>
                                        <span className="text-sm font-bold text-slate-800">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-3xl space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">Customer Reviews</h2>
                                <div className="flex items-center gap-2">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="#f59e0b" className="text-amber-400" />)}
                                    <span className="font-black text-slate-900 ml-2">4.8</span>
                                    <span className="text-slate-400 text-sm">(12 reviews)</span>
                                </div>
                            </div>
                            {[
                                { name: 'Rajan Mehta', rating: 5, date: '2 weeks ago', comment: 'Excellent camera quality! Night vision is outstanding, can clearly see 25-30 meters in complete darkness. Installation was straightforward and the mobile app works flawlessly.', verified: true },
                                { name: 'Priya Subramaniam', rating: 5, date: '1 month ago', comment: 'Bought 4 of these for my office premises. Build quality is solid, very weather-resistant as described. The motion detection alerts are very accurate with minimal false alarms.', verified: true },
                                { name: 'Arun Kumar', rating: 4, date: '1 month ago', comment: 'Very good value for money. Image quality is crisp and the wide-angle coverage is impressive. Setup took about 20 minutes. Would highly recommend for home security.', verified: false },
                            ].map((review, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center">
                                                <User size={20} className="text-[#0EA5E9]" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">{review.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {Array.from({length: review.rating}).map((_, s) => <Star key={s} size={12} fill="#f59e0b" className="text-amber-400" />)}
                                                    {review.verified && <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Verified</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">{review.date}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                            <button className="w-full py-5 border-2 border-dashed border-sky-200 rounded-[32px] text-[#0EA5E9] font-black hover:bg-sky-50 transition-all flex items-center justify-center gap-3">
                                <MessageCircle size={18} /> Write a Review
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>

            <CXFooter />
        </div>
    );
};

export default ProductDetail;
