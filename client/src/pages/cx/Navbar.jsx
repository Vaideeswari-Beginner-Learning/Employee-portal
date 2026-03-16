import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ShieldCheck, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/LoginModal';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const CXNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();
    const { user, setIsLoginModalOpen } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // CTRL+K shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        if (location.pathname !== '/home') {
            navigate('/home');
            setTimeout(() => {
                gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
            }, 500);
        } else {
            gsap.to(window, { duration: 1, scrollTo: id, ease: "power3.inOut" });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/catalog?search=${searchQuery}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const navLinks = [
        { name: 'Home', type: 'link', path: '/home' },
        { name: 'Products', type: 'link', path: '/catalog' },
        { name: 'Services', type: 'scroll', id: '#services' },
        { name: 'Installation', type: 'link', path: '/booking' },
        { name: 'Contact', type: 'scroll', id: '#booking' },
    ];

    const isActive = (link) => {
        if (link.type === 'link') return location.pathname === link.path;
        return false;
    };

    return (
        <>
            {/* Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-start justify-center pt-28 px-6"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="w-full max-w-3xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-sky-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <form onSubmit={handleSearch} className="flex items-center gap-4 px-8 py-6 border-b border-slate-100">
                                <Search size={22} className="text-[#0EA5E9] shrink-0" />
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search CCTV cameras, accessories..."
                                    className="flex-1 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
                                />
                                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </form>
                            <div className="px-8 py-4 flex gap-3 flex-wrap">
                                {['Dome Cameras', 'Bullet Cameras', 'PTZ Cameras', 'Wireless', 'Night Vision'].map(tag => (
                                    <button key={tag} onClick={() => { navigate(`/catalog?search=${tag}`); setSearchOpen(false); }}
                                        className="px-5 py-2.5 bg-slate-50 hover:bg-sky-50 hover:text-[#0EA5E9] text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:border-sky-100">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-2xl py-3 shadow-xl shadow-sky-50/40 border-b border-sky-50' : 'bg-transparent py-5'}`}>
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-6">

                        {/* Logo */}
                        <Link to="/home" className="flex items-center gap-3 shrink-0 group">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#0EA5E9] transition-all duration-500">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                    SK<span className="text-[#0EA5E9]">TECHNOLOGY</span>
                                </h1>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">CCTV & Security</p>
                            </div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                link.type === 'link' ? (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${isActive(link) ? 'bg-[#0EA5E9] text-white shadow-lg shadow-sky-200' : `${scrolled ? 'text-slate-600 hover:text-[#0EA5E9] hover:bg-sky-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}`}
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <button
                                        key={link.name}
                                        onClick={() => scrollToSection(link.id)}
                                        className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${scrolled ? 'text-slate-600 hover:text-[#0EA5E9] hover:bg-sky-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {link.name}
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <button onClick={() => setSearchOpen(true)}
                                className={`hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${scrolled ? 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-sky-200 hover:bg-sky-50' : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'}`}>
                                <Search size={14} />
                                <span className="hidden xl:inline">Search cameras...</span>
                                <kbd className="hidden xl:inline px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black">⌘K</kbd>
                            </button>

                            {/* Contact */}
                            <a href="tel:+919876543210" className={`hidden xl:flex items-center gap-2 text-xs font-black transition-all ${scrolled ? 'text-slate-600' : 'text-white/80'}`}>
                                <Phone size={14} className="text-[#0EA5E9]" />
                                +91 98765 43210
                            </a>

                            {/* Cart */}
                            <Link to="/cart" className={`relative p-3 rounded-2xl transition-all ${scrolled ? 'text-slate-700 hover:bg-sky-50 hover:text-[#0EA5E9]' : 'text-white hover:bg-white/10'}`}>
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0EA5E9] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Login */}
                            {!user ? (
                                <button 
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${scrolled ? 'bg-slate-900 text-white hover:bg-[#0EA5E9]' : 'bg-white text-slate-900 hover:bg-[#0EA5E9] hover:text-white'} shadow-lg`}
                                >
                                    <User size={16} />
                                    <span className="hidden md:inline">Login</span>
                                </button>
                            ) : (
                                <Link to="/dashboard" className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${scrolled ? 'bg-slate-900 text-white hover:bg-[#0EA5E9]' : 'bg-white text-slate-900 hover:bg-[#0EA5E9] hover:text-white'} shadow-lg`}>
                                    <User size={16} />
                                    <span className="hidden md:inline">Dashboard</span>
                                </Link>
                            )}

                            {/* Mobile Menu */}
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`lg:hidden p-3 rounded-2xl transition-all ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
                                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white border-t border-sky-50 shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-8 space-y-2">
                                {navLinks.map((link) => (
                                    link.type === 'link' ? (
                                        <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-slate-700 hover:bg-sky-50 hover:text-[#0EA5E9] transition-all uppercase tracking-wider text-sm">
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <button key={link.name} onClick={() => scrollToSection(link.id)}
                                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-slate-700 hover:bg-sky-50 hover:text-[#0EA5E9] transition-all uppercase tracking-wider text-sm text-left">
                                            {link.name}
                                        </button>
                                    )
                                ))}
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-center text-sm hover:bg-[#0EA5E9] transition-all"
                                    >
                                        Login / Register
                                    </button>
                                    <Link to="/cart" onClick={() => setIsMenuOpen(false)}
                                        className="px-6 py-4 bg-sky-50 text-[#0EA5E9] rounded-2xl font-black hover:bg-[#0EA5E9] hover:text-white transition-all flex items-center gap-2">
                                        <ShoppingCart size={18} />
                                        {cartCount > 0 && <span className="text-xs">({cartCount})</span>}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default CXNavbar;
