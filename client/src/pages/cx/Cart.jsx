import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Trash2, ShieldCheck, ChevronRight } from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/api';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const { user, setIsLoginModalOpen, setRedirectUrl } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <CXNavbar />
            
            <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Side: Cart Items */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 md:p-8 self-start">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
                        
                        {cart.length > 0 && <div className="text-slate-500 text-sm mb-6 text-right border-b border-slate-200 pb-2">Price</div>}

                        {cart.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingCart size={48} className="text-slate-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is empty</h2>
                                <p className="text-slate-500 mb-8 max-w-sm">
                                    Check out the Security Catalog to find cameras and accessories that fit your needs.
                                </p>
                                <Link to="/catalog" className="bg-[#facc15] hover:bg-[#eab308] text-slate-900 px-8 py-3 rounded-full font-bold transition-colors">
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {cart.map((item, index) => (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={`${item.product._id}-${index}`} 
                                        className="flex flex-col sm:flex-row gap-6 border-b border-slate-100 pb-6"
                                    >
                                        <div className="w-full sm:w-48 h-48 bg-white border border-slate-100 rounded-lg p-4 flex items-center justify-center relative overflow-hidden group shrink-0 mix-blend-multiply">
                                            {item.product.images?.front || item.product.images?.[0] ? (
                                                <img 
                                                    src={getImageUrl(item.product.images.front || item.product.images[0])} 
                                                    alt={item.product.name}
                                                    className="max-h-full object-contain cursor-pointer"
                                                    onClick={() => navigate(`/product/${item.product._id}`)}
                                                />
                                            ) : (
                                                <ShoppingCart size={40} className="text-slate-200" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col pt-2">
                                            <div className="flex justify-between items-start gap-4">
                                                <Link to={`/product/${item.product._id}`} className="text-lg font-bold text-slate-900 hover:text-[#2563EB] line-clamp-2">
                                                    {item.product.name}
                                                </Link>
                                                <div className="text-xl font-bold text-slate-900 shrink-0">
                                                    ₹{item.product.price.toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            <div className="text-sm text-[#22C55E] flex items-center gap-1 font-bold mt-1 mb-2">
                                                <Check size={16} /> In Stock
                                            </div>
                                            
                                            <p className="text-xs text-slate-500 mb-4 max-w-md">
                                                Sold by <span className="text-[#2563EB]">Smart Security India</span>. Covered by standard returns and {item.product.warranty || '1 Year'} Warranty.
                                            </p>

                                            <div className="mt-auto flex items-center gap-4">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center bg-slate-100 rounded-lg justify-between w-28 overflow-hidden shadow-sm border border-slate-200">
                                                    <button 
                                                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                                                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-slate-900 text-sm w-full text-center">{item.quantity}</span>
                                                    <button 
                                                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                
                                                <div className="w-px h-6 bg-slate-300" />

                                                <button 
                                                    onClick={() => removeFromCart(item.product._id)}
                                                    className="text-sm font-semibold text-[#0ea5e9] hover:underline flex items-center gap-1"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        
                        {cart.length > 0 && (
                            <div className="text-right pt-6">
                                <div className="text-lg">
                                    Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''}): <span className="font-bold text-slate-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Checkout Box */}
                    {cart.length > 0 && (
                        <div className="w-full lg:w-[320px] shrink-0">
                            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm sticky top-32">
                                {/* Free shipping banner */}
                                <div className="flex items-start gap-2 text-sm text-[#22C55E] mb-6">
                                    <Check size={20} className="shrink-0 animate-bounce" />
                                    <span>Your order is eligible for FREE Delivery. Delivery address selection during checkout.</span>
                                </div>

                                <h2 className="text-xl mb-4">
                                    Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''}): <br/>
                                    <span className="font-bold text-slate-900 mt-1 block">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </h2>

                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-6 group">
                                    <input type="checkbox" className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB] shadow-sm cursor-pointer" />
                                    This order contains a gift
                                </label>

                                <button 
                                    className="w-full bg-[#facc15] hover:bg-[#eab308] text-slate-900 py-3.5 rounded-full font-bold transition-colors shadow-sm flex items-center justify-center mb-6"
                                    onClick={() => {
                                        if (!user) {
                                            setRedirectUrl('/checkout');
                                            setIsLoginModalOpen(true);
                                        } else {
                                            navigate('/checkout');
                                        }
                                    }}
                                >
                                    Proceed to Buy
                                </button>
                                
                                <div className="text-xs text-slate-500 border border-slate-200 p-3 rounded bg-slate-50 flex gap-3">
                                    <ShieldCheck size={28} className="text-slate-400 shrink-0" />
                                    Safe and Secure Payments. Easy returns. 100% Authentic products.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <CXFooter />
        </div>
    );
};

export default Cart;
