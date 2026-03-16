import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollToPlugin, ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import {
    ChevronRight, ArrowRight, Star, ShoppingCart,
    Video, ShieldCheck, Home, Briefcase, Factory,
    Wrench, Camera, Phone, MessageSquare,
    Clock, Check, Wifi, Cloud,
    Eye, Radio, Activity, MapPin, Play,
    ChevronLeft, Zap, Users, Heart, Monitor,
    Cpu, Lock, Bell, Smartphone, AlertTriangle,
} from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api, { getImageUrl } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger);

// ─── CONSTANTS ────────────────────────────────────────────────
const THEME = {
    bg: '#FFFFFF',
    bgAlt: '#F0F9FF',
    primary: '#0EA5E9',
    accent: '#22C55E',
    text: '#0F172A',
    muted: '#64748B',
    card: '#FFFFFF',
    cardBorder: '#E0F2FE',
};

const CATEGORIES = [
    { name: 'Dome Cameras', desc: 'Indoor & retail 360° surveillance', img: '/uploads/cctv_dome.png', tag: 'Most Popular', color: '#2563EB' },
    { name: 'Bullet Cameras', desc: 'Long-range outdoor perimeter security', img: '/uploads/cctv_bullet.png', tag: 'Best Outdoor', color: '#22C55E' },
    { name: 'PTZ Cameras', desc: '360° pan-tilt-zoom monitoring', img: '/uploads/cctv_ptz.png', tag: 'High Range', color: '#F59E0B' },
    { name: 'Wireless Cameras', desc: 'Easy Wi-Fi setup, no wiring needed', img: '/uploads/cctv_node_hero.png', tag: 'Easy Install', color: '#EC4899' },
];

const REVIEWS = [
    { name: 'Rajan Mehta', role: 'Home Owner', rating: 5, text: 'Night vision is outstanding — can clearly see 30 meters in complete darkness. Installation was smooth and the mobile app works perfectly.' },
    { name: 'Priya Subramaniam', role: 'Office Manager', rating: 5, text: 'Bought 4 cameras for office. Very weather-resistant, motion detection is accurate with minimal false alarms. Highly recommend!' },
    { name: 'Arun Kumar', role: 'Warehouse Operator', rating: 4, text: 'Good value for money. Wide-angle coverage is impressive. Setup took 20 minutes. Would recommend for any business.' },
    { name: 'Deepa Nair', role: 'Shop Owner', rating: 5, text: 'Best CCTV service in the city! The team installed everything neatly and the remote viewing on mobile is crystal clear.' },
];

const STEPS = [
    { num: '01', icon: Camera, title: 'Choose Camera', desc: 'Browse our catalog and select the best camera for your needs.', img: '/uploads/service_grid_monitoring_1773398381443.png' },
    { num: '02', icon: Phone, title: 'Book Installation', desc: 'Fill our simple form and pick a preferred date for installation.', img: '/uploads/service_grid_install_1773398366613.png' },
    { num: '03', icon: Users, title: 'Technician Visit', desc: 'Our certified engineer visits your site and surveys the area.', img: '/uploads/service_grid_nightvision_1773398443380.png' },
    { num: '04', icon: ShieldCheck, title: 'System Live', desc: 'Cameras are installed, connected, and your system goes live.', img: '/uploads/service_grid_dvr_1773398398281.png' },
];

const WHY_US = [
    { icon: Clock, title: '24/7 Monitoring', desc: 'Round-the-clock surveillance support' },
    { icon: Monitor, title: 'HD/4K Quality', desc: 'Crystal-clear video in all conditions' },
    { icon: Cloud, title: 'Cloud Recording', desc: 'Secure cloud storage for footage' },
    { icon: Smartphone, title: 'Mobile Access', desc: 'View live feeds from anywhere' },
    { icon: Wrench, title: 'Pro Installation', desc: 'Certified engineers at your door' },
    { icon: Lock, title: 'AES-256 Encrypted', desc: 'Military-grade data security' },
];

const LIVE_FEEDS = [
    { label: 'Main Entrance', location: 'Entry Gate A', status: 'LIVE', motion: false, img: '/uploads/cctv_dome.png' },
    { label: 'Parking Area B2', location: 'Level -1 West', status: 'LIVE', motion: true, img: '/uploads/cctv_bullet.png' },
    { label: 'Storage Room', location: 'Warehouse East', status: 'LIVE', motion: false, img: '/uploads/cctv_ptz.png' },
    { label: 'Office Floor', location: '3rd Floor North', status: 'REC', motion: true, img: '/uploads/cctv_node_hero.png' },
];

// ─── ANIMATED COUNTER ─────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const end = parseInt(target);
        const duration = 1800;
        const step = (end / duration) * 16;
        const timer = setInterval(() => {
            start = Math.min(start + step, end);
            setCount(Math.floor(start));
            if (start >= end) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
const CXHome = () => {
    const navigate = useNavigate();
    const { user, setIsLoginModalOpen, setRedirectUrl } = useAuth();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [activeReview, setActiveReview] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [scanPos, setScanPos] = useState(0);
    const [bookingData, setBookingData] = useState({ name: '', phone: '', email: '', date: '', service: 'New CCTV Installation', message: '', address: '' });

    // Fetch products
    useEffect(() => {
        api.get('shop/products').then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setProducts(data.slice(0, 4));
        }).catch(() => {});
    }, []);

    // Auto rotate reviews
    useEffect(() => {
        const t = setInterval(() => setActiveReview(i => (i + 1) % REVIEWS.length), 4000);
        return () => clearInterval(t);
    }, []);

    // Scanning animation
    useEffect(() => {
        const t = setInterval(() => setScanPos(p => (p >= 100 ? 0 : p + 0.5)), 20);
        return () => clearInterval(t);
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        try {
            await api.post('shop/installation', bookingData);
            toast.success('Booking request sent!');
            setBookingData({ name: '', phone: '', email: '', date: '', service: 'New CCTV Installation', message: '', address: '' });
        } catch { toast.error('Failed. Please try again.'); }
        finally { setIsBooking(false); }
    };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: THEME.bg, color: THEME.text }}>

            <CXNavbar />

            {/* ═══════════════════════════════════════════
                HERO SECTION — Two-column, animated camera
            ═══════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 40%, #BAE6FD 100%)'}}>
                {/* Animated gradient background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(14,165,233,0.12) 0%, transparent 70%)'}} />
                    <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 60% 50% at 30% 80%, rgba(34,197,94,0.06) 0%, transparent 70%)'}} />
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left — Text Content */}
                        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold" style={{borderColor: `${THEME.accent}40`, color: THEME.accent, background: `${THEME.accent}10`}}>
                                    <span className="w-2 h-2 rounded-full animate-pulse" style={{background: THEME.accent}} />
                                    AI-Powered Surveillance
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight" style={{color: '#0F172A'}}>
                                SK Technology<br />
                                <span style={{color: THEME.primary}}>for Modern</span><br />
                                Security
                            </h1>
                            <p className="text-lg leading-relaxed max-w-lg" style={{color: THEME.muted}}>
                                Protect your home, office, and business with intelligent CCTV systems featuring AI motion detection, night vision, and real-time mobile alerts.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        if (!user) {
                                            setRedirectUrl('/catalog');
                                            setIsLoginModalOpen(true);
                                        } else {
                                            navigate('/catalog');
                                        }
                                    }}
                                    className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-sm shadow-2xl"
                                    style={{background: `linear-gradient(135deg, ${THEME.primary}, #0284C7)`, boxShadow: `0 20px 40px ${THEME.primary}40`}}
                                >
                                    <Eye size={18} /> Explore Cameras <ArrowRight size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        if (!user) {
                                            setRedirectUrl('/booking');
                                            setIsLoginModalOpen(true);
                                        } else {
                                            navigate('/booking');
                                        }
                                    }}
                                    className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm border"
                                    style={{borderColor: `${THEME.accent}50`, color: THEME.accent, background: `${THEME.accent}10`}}
                                >
                                    <Wrench size={18} /> Book Installation
                                </motion.button>
                            </div>
                            {/* Stats row */}
                            <div className="flex gap-10 pt-4">
                                {[{val:'5420', suf:'+', label:'Cameras Installed'}, {val:'2800', suf:'+', label:'Happy Clients'}, {val:'99', suf:'.9%', label:'Uptime Rate'}].map(s => (
                                    <div key={s.label}>
                                        <p className="text-3xl font-black" style={{color: '#0F172A'}}><Counter target={s.val} suffix={s.suf} /></p>
                                        <p className="text-xs mt-1" style={{color: THEME.muted}}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — Animated CCTV Camera */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative flex items-center justify-center">
                            {/* Outer glow ring */}
                            <div className="absolute inset-0 rounded-full opacity-15 blur-3xl" style={{background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)`}} />
                            {/* Camera container */}
                            <motion.div
                                animate={{ rotate: [0, 3, -3, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative z-10 w-80 h-80 lg:w-[420px] lg:h-[420px]"
                            >
                                {/* Glow border ring */}
                                <div className="absolute inset-0 rounded-full border-2 opacity-30 animate-spin" style={{borderColor: THEME.primary, animationDuration: '10s', borderTopColor: 'transparent'}} />
                                <div className="absolute inset-4 rounded-full border opacity-20 animate-spin" style={{borderColor: THEME.accent, animationDuration: '6s', animationDirection: 'reverse'}} />
                                {/* Main camera image */}
                                <div className="absolute inset-8 rounded-[40px] overflow-hidden shadow-2xl border" style={{borderColor: `${THEME.primary}40`, boxShadow: '0 25px 50px rgba(14,165,233,0.15)'}}>
                                    <img src={getImageUrl('/uploads/cctv_dome.png')} alt="CCTV Dome Camera" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0" style={{background: `linear-gradient(135deg, ${THEME.primary}20, transparent 60%)`}} />
                                    {/* Scan line on image */}
                                    <div className="absolute left-0 right-0 h-[2px]"
                                        style={{top: `${scanPos}%`, background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`, transition: 'top 0.02s linear'}} />
                                </div>
                                {/* HUD elements around the circle */}
                                {/* Top-left badge */}
                                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2" style={{background: 'rgba(255,255,255,0.9)', border: `1px solid ${THEME.accent}40`, color: THEME.accent, backdropFilter: 'blur(10px)'}}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: THEME.accent}} />LIVE
                                </div>
                                {/* Bottom-right badge */}
                                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black" style={{background: 'rgba(255,255,255,0.9)', border: `1px solid ${THEME.primary}40`, color: THEME.primary, backdropFilter: 'blur(10px)'}}>
                                    4K UHD
                                </div>
                                {/* Left badge */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 px-3 py-2 rounded-xl text-[9px] font-black" style={{background: 'rgba(255,255,255,0.9)', border: `1px solid ${THEME.muted}30`, color: '#64748B', backdropFilter: 'blur(10px)'}}>
                                    360°
                                </div>
                            </motion.div>

                            {/* Floating cards */}
                            <motion.div
                                animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity }}
                                className="absolute top-4 right-0 p-4 rounded-2xl text-xs font-bold shadow-2xl"
                                style={{background: 'rgba(255,255,255,0.9)', border: `1px solid ${THEME.primary}30`, backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(14,165,233,0.1)'}}>
                                <div className="flex items-center gap-2 mb-2" style={{color: THEME.accent}}>
                                    <Activity size={14} /> Motion Detected
                                </div>
                                <p style={{color: THEME.muted}} className="text-[10px]">Main Entrance — 14:32:05</p>
                            </motion.div>
                            <motion.div
                                animate={{ y: [6, -6, 6] }} transition={{ duration: 5, repeat: Infinity }}
                                className="absolute bottom-8 left-0 p-4 rounded-2xl text-xs font-bold shadow-2xl"
                                style={{background: 'rgba(255,255,255,0.9)', border: `1px solid ${THEME.accent}30`, backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(34,197,94,0.1)'}}>
                                <div className="flex items-center gap-2 mb-2" style={{color: '#0F172A'}}>
                                    <ShieldCheck size={14} style={{color: THEME.primary}} /> All Nodes Secure
                                </div>
                                <p style={{color: THEME.muted}} className="text-[10px]">24 cameras active</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SECURITY SCAN SECTION — Cyber animation
            ═══════════════════════════════════════════ */}
            <section className="py-24 relative overflow-hidden" style={{background: '#F0F9FF'}}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{backgroundImage: 'linear-gradient(rgba(14,165,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Scan animation graphic */}
                        <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="relative">
                            <div className="relative p-8 rounded-[40px] border" style={{background: 'rgba(255,255,255,0.8)', borderColor: '#E0F2FE', boxShadow: '0 20px 40px rgba(14,165,233,0.08)'}}>
                                {/* Camera icon → scan → target */}
                                <div className="flex items-center justify-between mb-8">
                                    {[
                                        {Icon: Camera, label: 'CCTV Node', color: THEME.primary},
                                        {Icon: Activity, label: 'AI Engine', color: THEME.accent},
                                        {Icon: ShieldCheck, label: 'Secured', color: '#F59E0B'},
                                    ].map(({Icon, label, color}, i) => (
                                        <React.Fragment key={label}>
                                            <motion.div
                                                animate={{boxShadow: [`0 0 0px ${color}`, `0 0 20px ${color}50`, `0 0 0px ${color}`]}}
                                                transition={{duration: 2, repeat: Infinity, delay: i*0.7}}
                                                className="flex flex-col items-center gap-3"
                                            >
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border" style={{background: `${color}15`, borderColor: `${color}40`}}>
                                                    <Icon size={28} style={{color}} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest" style={{color: THEME.muted}}>{label}</span>
                                            </motion.div>
                                            {i < 2 && (
                                                <div className="flex-1 mx-4 h-[2px] relative overflow-hidden rounded-full" style={{background: `${color}20`}}>
                                                    <motion.div
                                                        animate={{x: ['-100%', '200%']}} transition={{duration: 1.5, repeat: Infinity, delay: i*0.7, ease:'linear'}}
                                                        className="absolute inset-0 rounded-full" style={{background: `linear-gradient(90deg, transparent, ${color}, transparent)`}} />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {/* Feature checks */}
                                <div className="grid grid-cols-2 gap-3">
                                    {['Motion Detection', 'Face Recognition', 'Night Vision', 'Mobile Alerts', 'Cloud Backup', 'AI Analytics'].map(f => (
                                        <motion.div key={f} initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
                                            className="flex items-center gap-3 p-3 rounded-xl border" style={{background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.15)'}}>
                                            <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{background: THEME.accent}}>
                                                <Check size={12} className="text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-xs font-bold" style={{color: '#0F172A'}}>{f}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        {/* Text */}
                        <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border" style={{color: THEME.primary, borderColor: `${THEME.primary}40`, background: `${THEME.primary}10`}}>
                                <Cpu size={14} /> AI Powered System
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{color: '#0F172A'}}>
                                Intelligent Surveillance<br/><span style={{color: THEME.primary}}>Active 24/7</span>
                            </h2>
                            <p className="text-base leading-relaxed" style={{color: THEME.muted}}>
                                Our AI-powered CCTV system constantly monitors and analyzes footage using computer vision. Instant alerts are sent directly to your phone the moment anything unusual is detected.
                            </p>
                            <div className="flex flex-col gap-4">
                                {[
                                    {pct: 99, label: 'Motion Detection Accuracy'},
                                    {pct: 95, label: 'Face Recognition Rate'},
                                    {pct: 100, label: 'Night Vision Coverage'},
                                ].map(({pct, label}) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span style={{color: '#334155'}}>{label}</span>
                                            <span style={{color: THEME.accent}}>{pct}%</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{background: '#E0F2FE'}}>
                                            <motion.div initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:1.2, ease:'easeOut'}}
                                                className="h-full rounded-full" style={{background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`}} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                CAMERA CATEGORIES — Glassmorphism cards
            ═══════════════════════════════════════════ */}
            <section className="py-24 relative" style={{background: '#FFFFFF'}}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-xs font-black uppercase tracking-[0.3em]" style={{color: THEME.primary}}>Browse by Type</span>
                        <h2 className="text-5xl font-black tracking-tight" style={{color: '#0F172A'}}>
                            Camera <span style={{color: THEME.primary}}>Categories</span>
                        </h2>
                        <p className="max-w-lg mx-auto text-base" style={{color: THEME.muted}}>
                            Professional-grade CCTV systems engineered for every environment.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CATEGORIES.map((cat, i) => (
                            <motion.button
                                key={cat.name}
                                initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.1}}
                                whileHover={{y:-8, scale:1.02}}
                                onClick={() => navigate(`/catalog?category=${cat.name}`)}
                                className="group relative text-left overflow-hidden rounded-[32px] border transition-all duration-500"
                                style={{
                                    background: '#FFFFFF',
                                    backdropFilter: 'blur(20px)',
                                    borderColor: '#E0F2FE',
                                    boxShadow: '0 8px 32px rgba(14,165,233,0.08)'
                                }}
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px]"
                                    style={{background: `radial-gradient(ellipse at 50% 0%, ${cat.color}15, transparent 70%)`}} />
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden rounded-t-[32px]">
                                    <img src={getImageUrl(cat.img)} alt={cat.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)'}} />
                                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{background: `${cat.color}30`, color: cat.color, border: `1px solid ${cat.color}40`}}>
                                        {cat.tag}
                                    </div>
                                    {/* Corner HUD brackets */}
                                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg" style={{borderColor: `${cat.color}60`}} />
                                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg" style={{borderColor: `${cat.color}60`}} />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-black mb-1" style={{color: '#0F172A'}}>{cat.name}</h3>
                                    <p className="text-xs leading-relaxed mb-4" style={{color: THEME.muted}}>{cat.desc}</p>
                                    <div className="flex items-center gap-2 text-xs font-black" style={{color: cat.color}}>
                                        Browse All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                FEATURED CAMERAS — Product cards
            ═══════════════════════════════════════════ */}
            <section className="py-24" style={{background: '#F0F9FF'}}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-16">
                        <div className="space-y-3">
                            <span className="text-xs font-black uppercase tracking-[0.3em]" style={{color: THEME.accent}}>Top Picks</span>
                            <h2 className="text-5xl font-black tracking-tight" style={{color: '#0F172A'}}>Popular <span style={{color: THEME.primary}}>Cameras</span></h2>
                        </div>
                        <Link to="/catalog" className="flex items-center gap-2 text-sm font-black px-6 py-3 rounded-2xl border transition-all hover:bg-sky-50" style={{borderColor: `${THEME.primary}40`, color: THEME.primary}}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(products.length > 0 ? products : Array(4).fill(null).map((_, i) => ({
                            _id: `demo-${i}`,
                            name: ['Dome Pro 4K', 'Bullet Guard X8', 'PTZ Elite Pro', 'Wireless Node'][i],
                            category: ['Dome Cameras', 'Bullet Cameras', 'PTZ Cameras', 'Wireless Cameras'][i],
                            price: [2999, 3899, 6499, 1799][i],
                            shortDescription: ['360° indoor surveillance', 'Outdoor 50m range', 'Pan-tilt-zoom 100x', 'Wi-Fi easy install'][i],
                        }))).map((p, i) => (
                            <motion.div
                                key={p._id}
                                initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                                whileHover={{y:-6}}
                                className="group rounded-[28px] border overflow-hidden cursor-pointer transition-all duration-500"
                                style={{background:'#FFFFFF', borderColor:'#E0F2FE', boxShadow:'0 8px 30px rgba(14,165,233,0.06)'}}
                                onClick={() => navigate(`/product/${p._id}`)}
                            >
                                {/* Image */}
                                <div className="relative h-44 overflow-hidden" style={{background: '#F0F9FF'}}>
                                    <img
                                        src={p.images?.front ? getImageUrl(p.images.front) : '/cctv-dome.png'}
                                        alt={p.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(255,255,255,0.7), transparent)'}} />
                                    {/* Rating badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black" style={{background:'rgba(245,158,11,0.2)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.3)'}}>
                                        <Star size={10} fill="#F59E0B" /> {(4.5 + i*0.1).toFixed(1)}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <span className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color: THEME.primary}}>{p.category}</span>
                                    <h3 className="font-black text-sm leading-tight mb-2 group-hover:text-sky-500 transition-colors" style={{color: '#0F172A'}}>{p.name}</h3>
                                    <p className="text-xs mb-4 leading-relaxed" style={{color: THEME.muted}}>{p.shortDescription}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-black" style={{color: '#0F172A'}}>₹{p.price?.toLocaleString('en-IN')}</span>
                                        <button
                                            onClick={e => { 
                                                e.stopPropagation(); 
                                                if (!user) {
                                                    setRedirectUrl(`/product/${p._id}`);
                                                    setIsLoginModalOpen(true);
                                                } else {
                                                    addToCart(p, 1); 
                                                    toast.success('Added to cart!'); 
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all text-white"
                                            style={{background: THEME.primary}}
                                        >
                                            <ShoppingCart size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                LIVE MONITORING SECTION
            ═══════════════════════════════════════════ */}
            <section className="py-24 relative" style={{background: '#FFFFFF'}}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-xs font-black uppercase tracking-[0.3em]" style={{color: '#EF4444'}}>Real-Time Feeds</span>
                        <h2 className="text-5xl font-black tracking-tight" style={{color: '#0F172A'}}>Live <span style={{color: THEME.primary}}>Monitoring</span></h2>
                        <p style={{color: THEME.muted}}>Preview how our CCTV command center looks in real-time.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {LIVE_FEEDS.map((feed, i) => (
                            <motion.div
                                key={feed.label}
                                initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{once:true}} transition={{delay:i*0.15}}
                                className="relative rounded-[24px] overflow-hidden border group cursor-pointer"
                                style={{borderColor:'#E0F2FE', background:'#FFFFFF', boxShadow:'0 8px 30px rgba(14,165,233,0.06)'}}
                                onClick={() => navigate('/live-demo')}
                            >
                                {/* Camera feed image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img src={feed.img} alt={feed.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" style={{filter:'grayscale(30%)'}} />
                                    {/* Overlay */}
                                    <div className="absolute inset-0" style={{background:'rgba(14,165,233,0.1)'}} />
                                    {/* Scan line */}
                                    <div className="absolute left-0 right-0 h-[1px] opacity-60"
                                        style={{top:`${(scanPos + i*25) % 100}%`, background:`linear-gradient(90deg, transparent, ${THEME.primary}, transparent)`}} />
                                    {/* HUD corners */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{borderColor:`${THEME.primary}80`}} />
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{borderColor:`${THEME.primary}80`}} />
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{borderColor:`${THEME.primary}80`}} />
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{borderColor:`${THEME.primary}80`}} />
                                    {/* LIVE badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black" style={{background:'rgba(0,0,0,0.7)', color: feed.status==='LIVE'?'#EF4444':'#F59E0B'}}>
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: feed.status==='LIVE'?'#EF4444':'#F59E0B'}} />
                                        {feed.status}
                                    </div>
                                    {feed.motion && (
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-black" style={{background:'rgba(245,158,11,0.3)', color:'#F59E0B'}}>
                                            MOTION
                                        </div>
                                    )}
                                    {/* Node ID */}
                                    <div className="absolute bottom-3 left-3 text-[9px] font-black" style={{color:`${THEME.primary}80`}}>
                                        NODE_0{i+1}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm font-black" style={{color: '#0F172A'}}>{feed.label}</p>
                                    <p className="text-[10px] mt-1" style={{color:THEME.muted}}>{feed.location}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <Link to="/live-demo" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm border transition-all hover:bg-sky-600 hover:text-white"
                            style={{borderColor:`${THEME.primary}50`, color: THEME.primary, background:'rgba(14,165,233,0.08)'}}>
                            <Monitor size={18} /> Open Full Command Center
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                INSTALLATION PROCESS — Vertical Zigzag Timeline
            ═══════════════════════════════════════════ */}
            <section className="py-32 relative overflow-hidden" style={{ background: THEME.bgAlt }}>
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0EA5E9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-24 space-y-4">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: THEME.accent }}
                        >
                            Seamless Deployment
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="text-5xl lg:text-6xl font-black tracking-tighter" style={{ color: '#0F172A' }}
                        >
                            How It <span style={{ color: THEME.primary }}>Works</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="max-w-xl mx-auto text-base" style={{ color: THEME.muted }}
                        >
                            Your security infrastructure, deployed in four strategic phases.
                        </motion.p>
                    </div>

                    <div className="relative">
                        {/* Central Root Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden md:block" style={{ background: `linear-gradient(to bottom, transparent, ${THEME.primary}40, ${THEME.accent}40, transparent)` }}>
                            <motion.div 
                                initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeInOut" }}
                                className="w-full origin-top" style={{ background: `linear-gradient(to bottom, ${THEME.primary}, ${THEME.accent})` }}
                            />
                        </div>

                        <div className="space-y-24 md:space-y-0">
                            {STEPS.map((step, i) => (
                                <div key={step.num} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                    {/* Content Area */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className={`w-full md:w-[45%] flex flex-col ${i % 2 === 0 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}
                                    >
                                        <div className="p-8 rounded-[2.5rem] border bg-white/50 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden" style={{ borderColor: THEME.cardBorder }}>
                                            <div className="relative h-32 mb-6 rounded-2xl overflow-hidden">
                                                <img src={getImageUrl(step.img)} alt={step.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                                                <div className={`absolute top-4 ${i % 2 === 0 ? 'right-4' : 'left-4'} w-12 h-12 rounded-xl flex items-center justify-center border bg-white shadow-xl`} style={{ borderColor: `${THEME.primary}20` }}>
                                                    <step.icon size={24} style={{ color: THEME.primary }} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: THEME.primary }}>Step {step.num}</span>
                                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#0F172A' }}>{step.title}</h3>
                                            <p className="text-sm leading-relaxed max-w-sm" style={{ color: THEME.muted }}>{step.desc}</p>
                                        </div>
                                    </motion.div>

                                    {/* Center Node */}
                                    <div className="relative z-20 flex items-center justify-center w-full md:w-[10%]">
                                        <motion.div 
                                            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                                            className="w-12 h-12 rounded-full bg-white border-4 flex items-center justify-center shadow-xl"
                                            style={{ borderColor: i % 2 === 0 ? THEME.primary : THEME.accent }}
                                        >
                                            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: i % 2 === 0 ? THEME.primary : THEME.accent }} />
                                        </motion.div>
                                    </div>

                                    {/* Empty Spacer for Desktop */}
                                    <div className="hidden md:block w-[45%]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-24">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!user) {
                                    setRedirectUrl('/booking');
                                    setIsLoginModalOpen(true);
                                } else {
                                    navigate('/booking');
                                }
                            }}
                            className="inline-flex items-center gap-4 px-12 py-5 rounded-[2rem] font-black text-white text-base shadow-2xl relative overflow-hidden group"
                            style={{ background: THEME.primary }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Wrench size={22} />
                            <span>Initialize Secure Deployment</span>
                            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Consultation • Site Survey Included</p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                WHY CHOOSE US — Icon cards
            ═══════════════════════════════════════════ */}
            <section className="py-24" style={{background: '#FFFFFF'}}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-xs font-black uppercase tracking-[0.3em]" style={{color: THEME.primary}}>Our Advantage</span>
                        <h2 className="text-5xl font-black tracking-tight" style={{color: '#0F172A'}}>Why Choose <span style={{color: THEME.primary}}>Us</span></h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                        {WHY_US.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                                whileHover={{y:-6, scale:1.03}}
                                className="group flex flex-col items-center text-center p-6 rounded-[28px] border transition-all duration-500 cursor-default"
                                style={{background:'#FFFFFF', borderColor:'#E0F2FE', boxShadow:'0 4px 20px rgba(14,165,233,0.06)'}}
                            >
                                <motion.div
                                    animate={{boxShadow: [`0 0 0px ${THEME.primary}`, `0 0 20px ${THEME.primary}40`, `0 0 0px ${THEME.primary}`]}}
                                    transition={{duration: 3, repeat:Infinity, delay: i*0.5}}
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
                                    style={{background:`${THEME.primary}15`, borderColor:`${THEME.primary}30`}}
                                >
                                    <item.icon size={24} style={{color: THEME.primary}} />
                                </motion.div>
                                <h3 className="text-sm font-black mb-1 leading-tight" style={{color: '#0F172A'}}>{item.title}</h3>
                                <p className="text-[10px] leading-relaxed" style={{color: THEME.muted}}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                    {/* Stats banner */}
                    <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {val:5420, suf:'+', label:'Cameras Installed', color:THEME.primary},
                            {val:2800, suf:'+', label:'Happy Customers', color:THEME.accent},
                            {val:15, suf:'+', label:'Years Experience', color:'#F59E0B'},
                            {val:99, suf:'.9%', label:'Client Satisfaction', color:'#EC4899'},
                        ].map(s => (
                            <motion.div key={s.label} initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
                                className="p-6 rounded-[24px] text-center border" style={{background:'#FFFFFF', borderColor:'#E0F2FE', boxShadow:'0 6px 24px rgba(14,165,233,0.06)'}}>
                                <p className="text-4xl font-black mb-1" style={{color:s.color}}><Counter target={s.val} suffix={s.suf} /></p>
                                <p className="text-xs" style={{color:THEME.muted}}>{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                CUSTOMER REVIEWS — Auto-sliding carousel
            ═══════════════════════════════════════════ */}
            <section className="py-24" style={{background:'#F0F9FF'}}>
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-xs font-black uppercase tracking-[0.3em]" style={{color:'#F59E0B'}}>Testimonials</span>
                        <h2 className="text-5xl font-black tracking-tight" style={{color: '#0F172A'}}>Customer <span style={{color:THEME.primary}}>Reviews</span></h2>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeReview}
                            initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-30}}
                            className="relative p-10 rounded-[40px] border text-center"
                            style={{background:'#FFFFFF', borderColor:'#E0F2FE', boxShadow:'0 10px 40px rgba(14,165,233,0.06)'}}
                        >
                            <div className="flex justify-center mb-6">
                                {Array.from({length: REVIEWS[activeReview].rating}).map((_, s) => (
                                    <Star key={s} size={22} fill="#F59E0B" className="text-amber-400" />
                                ))}
                            </div>
                            <blockquote className="text-xl leading-relaxed mb-8 font-medium max-w-2xl mx-auto" style={{color: '#1E293B'}}>
                                "{REVIEWS[activeReview].text}"
                            </blockquote>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{background:`${THEME.primary}20`, border:`2px solid ${THEME.primary}40`}}>
                                    <span className="text-base font-black" style={{color:THEME.primary}}>{REVIEWS[activeReview].name[0]}</span>
                                </div>
                                <p className="font-black" style={{color: '#0F172A'}}>{REVIEWS[activeReview].name}</p>
                                <p className="text-xs" style={{color:THEME.muted}}>{REVIEWS[activeReview].role}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-center gap-3 mt-8">
                        {REVIEWS.map((_, i) => (
                            <button key={i} onClick={() => setActiveReview(i)}
                                className="h-2 rounded-full transition-all duration-500"
                                style={{width: i===activeReview ? '40px':'8px', background: i===activeReview ? THEME.primary : '#CBD5E1'}} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SMART SECURITY CTA BANNER
            ═══════════════════════════════════════════ */}
            <section className="relative py-32 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <img src={getImageUrl('/uploads/cctv_hero_main.png')} alt="Security Camera" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(14,165,233,0.9) 0%, rgba(2,132,199,0.85) 50%, rgba(14,165,233,0.95) 100%)'}} />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border"
                            style={{color:THEME.accent, borderColor:`${THEME.accent}40`, background:`${THEME.accent}10`}}>
                            <ShieldCheck size={14} /> Trusted by 2800+ Customers
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white">
                            Protect What<br/><span style={{color:THEME.primary}}>Matters Most</span>
                        </h2>
                        <p className="text-lg" style={{color:'rgba(255,255,255,0.85)'}}>
                            Get a free consultation and site survey from our security experts. No obligation — just expert advice for your security needs.
                        </p>
                        <div className="flex flex-wrap justify-center gap-5">
                            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.97}} 
                                onClick={() => {
                                    if (!user) {
                                        setRedirectUrl('/booking');
                                        setIsLoginModalOpen(true);
                                    } else {
                                        navigate('/booking');
                                    }
                                }}
                                className="px-10 py-5 rounded-2xl font-black text-base shadow-2xl"
                                style={{background:'#FFFFFF', color: THEME.primary, boxShadow:'0 20px 40px rgba(0,0,0,0.15)'}}>
                                Book Free Consultation
                            </motion.button>
                            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.97}} 
                                onClick={() => {
                                    if (!user) {
                                        setRedirectUrl('/catalog');
                                        setIsLoginModalOpen(true);
                                    } else {
                                        navigate('/catalog');
                                    }
                                }}
                                className="px-10 py-5 rounded-2xl font-black text-base border"
                                style={{color:'white', borderColor:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.1)'}}>
                                Explore Products
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <CXFooter />
        </div>
    );
};

export default CXHome;
