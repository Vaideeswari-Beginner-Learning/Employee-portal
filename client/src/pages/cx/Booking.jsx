import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, MapPin, Camera, User, Phone, CheckCircle2, ArrowRight, Wrench } from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api, { getImageUrl } from '../../utils/api';

const Booking = () => {
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        location: '',
        numberOfCameras: 1,
        installationType: 'Home'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [requestId, setRequestId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('shop/installation', formData);
            if (res.data) {
                setRequestId(res.data.requestId);
                setIsSuccess(true);
            }
        } catch (err) {
            console.error("Booking error:", err);
            if (err.response?.status === 401) {
                alert("Please log in to submit an installation request.");
            } else {
                alert(err.response?.data?.message || "Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50">
                <CXNavbar />
                <main className="max-w-3xl mx-auto px-4 pt-40 pb-20">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden text-center"
                    >
                        <div className="bg-[#22C55E] p-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#22C55E] mb-4 shadow-lg">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Booking Confirmed!</h2>
                        </div>
                        <div className="p-10">
                            <p className="text-slate-600 text-lg mb-8">
                                Your installation request has been received. Our technician will contact you shortly to schedule the visit.
                            </p>
                            
                            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-1">Request ID</span>
                                <span className="text-2xl font-black text-slate-900 tracking-wider">{requestId}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => (window.location.href = '/home')}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Return to Home
                                </button>
                                <button 
                                    onClick={() => setIsSuccess(false)}
                                    className="bg-white text-slate-900 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Book Another
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </main>
                <CXFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <CXNavbar />
            
            <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Hero Section for Booking */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-blue-400 max-w-4xl mx-auto rounded-full" />
                        <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                            <Wrench size={40} />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Professional <span className="text-[#2563EB]">CCTV Deployment</span>
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg mb-10">
                            Elite technical support and installation services for your security infrastructure.
                        </p>
                        
                        <div className="max-w-4xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 mb-12 relative group">
                             <img 
                                src={getImageUrl('/uploads/service_grid_install_1773398366613.png')} 
                                alt="Installation Service" 
                                className="w-full h-[400px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                             <div className="absolute bottom-8 left-8 text-left">
                                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                                    <MapPin size={14} /> Service Center Active
                                </div>
                                <div className="text-white text-2xl font-bold">On-Site Security Analysis & Setup</div>
                             </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Side: Features & Trust */}
                    <div className="space-y-8 pt-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
                            <div className="w-14 h-14 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Certified Technicians</h3>
                                <p className="text-slate-600">All our installation partners are background-checked and highly trained professionals.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
                            <div className="w-14 h-14 bg-green-50 text-[#22C55E] rounded-xl flex items-center justify-center shrink-0">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Scheduling</h3>
                                <p className="text-slate-600">Pick a time slot that works for you. We provide 24/7 installation support for commercial setups.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Post-Install Support</h3>
                                <p className="text-slate-600">Includes camera configuration, mobile app setup, and initial surveillance training.</p>
                            </div>
                        </div>

                        {/* Stats / Trust Banner */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0f172a] p-6 rounded-2xl text-center">
                                <div className="text-3xl font-black text-white">500+</div>
                                <div className="text-slate-400 text-sm uppercase tracking-wider font-bold mt-1">Clients Served</div>
                            </div>
                            <div className="bg-[#2563EB] p-6 rounded-2xl text-center">
                                <div className="text-3xl font-black text-white">4.9/5</div>
                                <div className="text-blue-100 text-sm uppercase tracking-wider font-bold mt-1">Service Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Booking Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                             Fill Service Details <ArrowRight size={20} className="text-[#2563EB]" />
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <User size={16} /> Full Name
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Phone size={16} /> Mobile Number
                                    </label>
                                    <input 
                                        required
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <MapPin size={16} /> Installation Location
                                </label>
                                <textarea 
                                    required
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter your complete address..."
                                    rows="3"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Camera size={16} /> Number of Cameras
                                    </label>
                                    <input 
                                        required
                                        type="number" 
                                        name="numberOfCameras"
                                        value={formData.numberOfCameras}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Installation Type
                                    </label>
                                    <select 
                                        name="installationType"
                                        value={formData.installationType}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Home">Home Security</option>
                                        <option value="Office">Office Setup</option>
                                        <option value="Commercial">Commercial/Factory</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {isSubmitting ? (
                                    <>Processing Request...</>
                                ) : (
                                    <>Book Installation Now</>
                                )}
                            </button>

                            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                                Safe and Reliable Security Services
                            </p>
                        </form>
                    </motion.div>
                </div>
            </main>
            
            <CXFooter />
        </div>
    );
};

export default Booking;
