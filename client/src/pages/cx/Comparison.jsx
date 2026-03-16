import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronLeft, Cpu, Zap, Shield, BarChart3, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api from '../../utils/api';

const Comparison = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api.get('cx/products');
                // Fallback for demo
                if (res.data.length === 0) {
                    const fallback = [
                        { _id: '1', name: 'Nikon Z9 Pro', price: 5499, category: 'DSLR', technicalSpecs: [ { label: 'Resolution', value: '45.7 MP' }, { label: 'Video', value: '8K/60p' }, { label: 'Battery', value: 'EVF 700 shots' }, { label: 'Weight', value: '1340g' } ] },
                        { _id: '2', name: 'Sony Alpha A1', price: 6499, category: 'Mirrorless', technicalSpecs: [ { label: 'Resolution', value: '50.1 MP' }, { label: 'Video', value: '8K/30p' }, { label: 'Battery', value: 'EVF 530 shots' }, { label: 'Weight', value: '737g' } ] },
                        { _id: '3', name: 'Canon EOS R3', price: 5999, category: 'Mirrorless', technicalSpecs: [ { label: 'Resolution', value: '24.1 MP' }, { label: 'Video', value: '6K/60p' }, { label: 'Battery', value: 'EVF 620 shots' }, { label: 'Weight', value: '1015g' } ] }
                    ];
                    setAllProducts(fallback);
                    setSelectedProducts([fallback[0], fallback[1]]);
                } else {
                    setAllProducts(res.data);
                    // Ensure the initial products have specifications to work with
                    const initial = res.data.filter(p => p.technicalSpecs?.length > 0).slice(0, 2);
                    setSelectedProducts(initial.length > 0 ? initial : res.data.slice(0, 2));
                }
            } catch (err) {
                console.error("Error fetching for comparison:", err);
            }
        };
        fetchAll();
    }, []);

    const addProduct = (product) => {
        if (selectedProducts.length >= 4) return;
        if (!selectedProducts.find(p => p._id === product._id)) {
            setSelectedProducts([...selectedProducts, product]);
        }
        setShowSelector(false);
    };

    const removeProduct = (id) => {
        setSelectedProducts(selectedProducts.filter(p => p._id !== id));
    };

    const getSpecValue = (product, label) => {
        const spec = product.technicalSpecs?.find(s => s.label === label);
        return spec ? spec.value : 'N/A';
    };

    const specKeys = [
        'Resolution', 'Video', 'Battery', 'Weight', 'ISO Range', 'AF Points', 'Sensor Type'
    ];

    return (
        <div className="min-h-screen bg-white">
            <CXNavbar />

            <main className="max-w-7xl mx-auto px-4 pt-40 pb-32">
                <div className="mb-16">
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-4 block">Analytical Node Comparison</span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Metric Synchronization</h1>
                    <p className="text-sm text-slate-500 font-medium max-w-xl">
                        Analyze technical specifications across our modular grid components to ensure optimal compatibility for your deployment.
                    </p>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                    {/* Comparison Grid */}
                    <div className="flex-1 min-w-[800px]">
                        {/* Header Row */}
                        <div className="flex bg-slate-50/50 rounded-t-[2.5rem] p-8 border-x border-t border-slate-100">
                            <div className="w-1/4 pr-8 flex flex-col justify-center">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Specifications</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-2">Side-by-side analysis</p>
                            </div>
                            <div className="flex-1 flex gap-6">
                                {selectedProducts.map(product => (
                                    <div key={product._id} className="flex-1 relative group">
                                        <button 
                                            onClick={() => removeProduct(product._id)}
                                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group/card">
                                            <div className="w-full h-24 bg-slate-50 rounded-xl mb-4 flex items-center justify-center p-2">
                                                {product.images?.front ? (
                                                    <img src={product.images.front} alt="" className="max-h-full object-contain" />
                                                ) : (
                                                    <Layers size={20} className="text-sky-500" />
                                                )}
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 mb-1 truncate">{product.name}</h4>
                                            <p className="text-[11px] font-black text-sky-500 uppercase tracking-widest">${product.price}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {selectedProducts.length < 4 && (
                                    <button 
                                        onClick={() => setShowSelector(true)}
                                        className="flex-1 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-slate-300 hover:text-sky-500"
                                    >
                                        <Plus size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Node</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Specs Rows */}
                        <div className="border-x border-b border-slate-100 rounded-b-[2.5rem] overflow-hidden">
                            {specKeys.map((key, i) => (
                                <div key={key} className={`flex p-8 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                    <div className="w-1/4 pr-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                                    </div>
                                    <div className="flex-1 flex gap-6">
                                        {selectedProducts.map(product => (
                                            <div key={product._id} className="flex-1 px-2">
                                                <span className="text-sm font-black text-slate-800">{getSpecValue(product, key)}</span>
                                            </div>
                                        ))}
                                        {[...Array(4 - selectedProducts.length)].map((_, i) => (
                                            <div key={i} className="flex-1" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {/* Actions Row */}
                            <div className="flex p-8 bg-slate-900">
                                <div className="w-1/4 pr-8 flex items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Deployment</span>
                                </div>
                                <div className="flex-1 flex gap-6">
                                    {selectedProducts.map(product => (
                                        <div key={product._id} className="flex-1">
                                            <button className="w-full bg-sky-500 text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all">
                                                Buy Now
                                            </button>
                                        </div>
                                    ))}
                                    {[...Array(4 - selectedProducts.length)].map((_, i) => (
                                        <div key={i} className="flex-1" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Product Selector Modal */}
            <AnimatePresence>
                {showSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSelector(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative z-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Add to Comparison</h3>
                                <button onClick={() => setShowSelector(false)} className="text-slate-400 hover:text-slate-900">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {allProducts.map(product => (
                                    <button 
                                        key={product._id}
                                        onClick={() => addProduct(product)}
                                        disabled={selectedProducts.find(p => p._id === product._id)}
                                        className={`p-6 rounded-3xl border flex flex-col gap-2 transition-all text-left ${selectedProducts.find(p => p._id === product._id) ? 'bg-slate-50 border-slate-100 opacity-50 grayscale cursor-not-allowed' : 'bg-white border-slate-100 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-100'}`}
                                    >
                                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">{product.category}</span>
                                        <span className="text-sm font-black text-slate-900">{product.name}</span>
                                        <span className="text-xs font-bold text-slate-400">${product.price}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CXFooter />
        </div>
    );
};

export default Comparison;
