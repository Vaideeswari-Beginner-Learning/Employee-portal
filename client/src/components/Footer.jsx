import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Attendance', path: '/attendance' },
        { name: 'Reports', path: '/reports' },
        { name: 'Leave', path: '/leave' },
        { name: 'Settings', path: '/settings' },
    ];

    return (
        <footer className="bg-white border-t border-slate-100 mt-auto">
            <div className="max-w-[1600px] mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                <Shield size={22} />
                            </div>
                            <div>
                                <span className="font-display font-black text-slate-900 tracking-tight text-lg block leading-none">PORTAL<span className="text-primary-600">.Connect</span></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 block">Integrated HR Ecosystem</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Empowering CCTV installation professionals with high-precision management and real-time operational telemetry.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-2 group"
                                    >
                                        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Operational Node</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                    <Mail size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Support Email</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">ops@cctvconnect.com</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                    <Phone size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Line</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">+1 (555) 900-2024</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Compliance</h4>
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                                This portal is a secured operational environment. All actions are logged and audited for compliance.
                            </p>
                            <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:gap-3 transition-all">
                                Protocol Docs <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        © {currentYear} PORTAL.CONNECT. ALL SYSTEMS OPERATIONAL.
                    </p>
                    <div className="flex items-center gap-8">
                        <button onClick={() => navigate('/settings')} className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Privacy Policy</button>
                        <button onClick={() => navigate('/reports')} className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Incident Report</button>
                        <button onClick={() => navigate('/dashboard')} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Secure Node
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
