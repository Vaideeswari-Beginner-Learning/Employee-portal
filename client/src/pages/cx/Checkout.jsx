import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { setIsLoginModalOpen, setRedirectUrl } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simple state for checkout form
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare order data formatting according to backend expected schema
            const orderData = {
                shippingAddress: {
                    street: `${formData.addressLine1} ${formData.addressLine2}`.trim(),
                    city: formData.city,
                    state: formData.state,
                    zip: formData.pincode,
                    country: 'India'
                },
                products: cart.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    priceAtPurchase: item.product.price
                })),
                totalAmount: cartTotal
            };

            const res = await api.post('shop/order', orderData);

            if (res.data) {
                clearCart();
                alert(`Order placed successfully! Order ID: ${res.data.orderId}`);
                navigate('/orders'); // Redirect to their orders page
            }

        } catch (error) {
            console.error("Checkout error:", error);
            if (error.response?.status === 401) {
                // Trigger Login Modal instead of navigating
                setRedirectUrl('/checkout');
                setIsLoginModalOpen(true);
            } else {
                alert(error.response?.data?.message || "Failed to place order. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg border border-slate-200 text-center max-w-md w-full shadow-sm">
                    <ShieldCheck size={48} className="text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No items to checkout</h2>
                    <p className="text-slate-500 mb-6">Your cart is empty. Please add items before proceeding.</p>
                    <Link to="/catalog" className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-md font-bold">
                        Browse Catalog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Minimal Checkout Header */}
            <header className="bg-white border-b border-slate-200 py-4 top-0 sticky z-50">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">Smart Security Checkout</span>
                    </Link>
                    <Lock size={20} className="text-slate-400" />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Shipping Form */}
                    <div className="flex-1">
                        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 mb-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
                                Delivery Address
                            </h2>

                            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Flat, House no., Building, Company, Apartment</label>
                                    <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Area, Street, Sector, Village</label>
                                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Town/City</label>
                                        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">State</label>
                                        <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                    </div>
                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <label className="text-sm font-bold text-slate-700">Pincode</label>
                                        <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 opacity-50 select-none">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-300 text-white text-xs flex items-center justify-center">2</span>
                                Payment Method
                            </h2>
                            <p className="pl-8 text-sm mt-2">Cash on Delivery (Pay when you receive the items)</p>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full lg:w-[350px] shrink-0">
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-24 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-200">
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#facc15] hover:bg-[#eab308] disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-900 py-3 rounded-md font-bold transition-colors shadow-sm"
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Your Order'}
                                </button>
                                <p className="text-xs text-center text-slate-500 mt-3 px-2">
                                    By placing your order, you agree to Smart Security's privacy notice and conditions of use.
                                </p>
                            </div>

                            <div className="p-6">
                                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                                <div className="space-y-2 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex justify-between">
                                        <span>Items:</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery:</span>
                                        <span className="text-[#22C55E]">FREE</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                                        <span>Total:</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-[#b12704] text-xl">Order Total:</span>
                                    <span className="font-bold text-[#b12704] text-2xl">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-600 space-y-3">
                                <div className="flex gap-3">
                                    <Truck size={20} className="text-slate-400 shrink-0" />
                                    <p>Guaranteed delivery within 3-5 business days across India.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CreditCard size={20} className="text-slate-400 shrink-0" />
                                    <p>Cash on Delivery available for this order.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
