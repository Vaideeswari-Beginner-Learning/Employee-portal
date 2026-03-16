import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowUp, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const CXFooter = () => {
    const scrollToTop = () => gsap.to(window, { duration: 1.5, scrollTo: 0, ease: "power4.inOut" });

    return (
        <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                    {/* Brand Column */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-lg shadow-sky-900/30">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tighter leading-none">SK<span className="text-[#0EA5E9]">TECHNOLOGY</span></h2>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">CCTV & Security</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            India's trusted CCTV & surveillance solutions provider. Securing homes, offices and businesses with cutting-edge security technology.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: Facebook, href: '#', label: 'Facebook' },
                                { Icon: Instagram, href: '#', label: 'Instagram' },
                                { Icon: Twitter, href: '#', label: 'Twitter' },
                                { Icon: Youtube, href: '#', label: 'YouTube' },
                            ].map(({ Icon, href, label }) => (
                                <a key={label} href={href} aria-label={label}
                                    className="w-10 h-10 bg-slate-800 hover:bg-[#0EA5E9] rounded-xl flex items-center justify-center transition-all duration-300 group">
                                    <Icon size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 pb-3 border-b border-slate-800">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', to: '/home' },
                                { label: 'Products', to: '/catalog' },
                                { label: 'Live Demo', to: '/live-demo' },
                                { label: 'Book Installation', to: '/booking' },
                                { label: 'My Orders', to: '/my-orders' },
                                { label: 'Cart', to: '/cart' },
                            ].map(link => (
                                <li key={link.label}>
                                    <Link to={link.to}
                                        className="text-sm text-slate-400 hover:text-[#0EA5E9] transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 bg-slate-700 group-hover:bg-[#0EA5E9] rounded-full transition-colors shrink-0" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 pb-3 border-b border-slate-800">Our Services</h3>
                        <ul className="space-y-3">
                            {[
                                'Home CCTV Installation',
                                'Office Security Setup',
                                'Warehouse Monitoring',
                                'Camera Maintenance',
                                'IP Network Cameras',
                                'Cloud Storage Setup',
                            ].map(service => (
                                <li key={service}>
                                    <span className="text-sm text-slate-400 hover:text-[#0EA5E9] transition-colors flex items-center gap-2 group cursor-default">
                                        <span className="w-1.5 h-1.5 bg-slate-700 group-hover:bg-[#0EA5E9] rounded-full transition-colors shrink-0" />
                                        {service}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 pb-3 border-b border-slate-800">Contact Us</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4">
                                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={15} className="text-[#0EA5E9]" />
                                </div>
                                <p className="text-sm leading-relaxed">
                                    No. 12, Security Tower, MG Road,<br />
                                    Bengaluru, Karnataka – 560001
                                </p>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone size={15} className="text-[#0EA5E9]" />
                                </div>
                                <a href="tel:+919876543210" className="text-sm hover:text-[#0EA5E9] transition-colors">+91 98765 43210</a>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail size={15} className="text-[#0EA5E9]" />
                                </div>
                                <a href="mailto:support@sktechnology.in" className="text-sm hover:text-[#0EA5E9] transition-colors">support@sktechnology.in</a>
                            </li>
                        </ul>

                        {/* CTA Box */}
                        <div className="mt-8 p-5 bg-slate-900 rounded-2xl border border-slate-800">
                            <p className="text-xs font-black text-white mb-3">Get a Free Quote</p>
                            <p className="text-[11px] text-slate-500 mb-4">Book a free site survey for your home or office security setup.</p>
                            <Link to="/booking"
                                className="block w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white text-center text-xs font-black rounded-xl transition-all">
                                Book Now →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} SK Technology CCTV & Security. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</a>
                        <button onClick={scrollToTop}
                            className="w-9 h-9 bg-slate-800 hover:bg-[#0EA5E9] rounded-xl flex items-center justify-center transition-all group">
                            <ArrowUp size={15} className="text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default CXFooter;
