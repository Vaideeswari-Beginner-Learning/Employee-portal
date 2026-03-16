import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, ShieldCheck, Activity, Terminal, Database, Radio, 
    Wifi, Signal, Clock, Maximize2, Monitor, MapPin, 
    Video, Binary, Cpu, Network, Zap, Play
} from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import { getImageUrl } from '../../utils/api';

const LiveDemo = () => {
    const [activeFeed, setActiveFeed] = useState(0);
    const [isScanning, setIsScanning] = useState(true);
    const [bitrate, setBitrate] = useState(42.5);

    const feeds = [
        { id: 'NODE_01', location: 'Main Entrance (Shop)', type: '4K Ultra HD', latency: '0.08ms', url: '/uploads/cctv_hero_main.png' },
        { id: 'NODE_02', location: 'Parking Area B2', type: 'Night Vision XT', latency: '0.12ms', url: '/uploads/cctv_bullet.png' },
        { id: 'NODE_03', location: 'Storage Rack 04', type: 'Panoramic PTZ', latency: '0.10ms', url: '/uploads/cctv_ptz.png' },
        { id: 'NODE_04', location: 'Manager Office', type: 'Covert Mini', latency: '0.05ms', url: '/uploads/cctv_dome.png' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setBitrate(prev => +(prev + (Math.random() * 2 - 1)).toFixed(2));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#0EA5E9] selection:text-white overflow-x-hidden tech-grid">
            <CXNavbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Console: Feed Viewport */}
                    <div className="lg:w-8/12 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">LIVE_COMMAND_CENTER</h1>
                                </div>
                                <p className="mono-tech text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">Session Active // Node_{feeds[activeFeed].id}</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0EA5E9] hover:bg-sky-50 transition-all">
                                    <Maximize2 size={20} />
                                </button>
                                <button className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-xl shadow-slate-200 active:scale-95 transition-all">
                                    <Monitor size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Main Viewport */}
                        <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden border border-sky-100 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] group">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeFeed}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 1, ease: "expo.out" }}
                                    src={getImageUrl(feeds[activeFeed].url)} 
                                    alt="Live Feed"
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000"
                                />
                            </AnimatePresence>

                            {/* HUD Overlays */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="scan-line" />
                                
                                {/* Corner Accents */}
                                <div className="absolute top-8 left-8 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white mono-tech">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Radio size={12} className="text-[#0EA5E9] animate-pulse" />
                                        <span className="text-xs font-black tracking-widest">{feeds[activeFeed].id}</span>
                                    </div>
                                    <div className="text-[10px] opacity-60 mb-4">{feeds[activeFeed].location}</div>
                                    <div className="flex items-center gap-4 text-[9px]">
                                        <div className="flex items-center gap-1"><Signal size={10} className="text-green-400" /> STABLE</div>
                                        <div className="flex items-center gap-1"><Clock size={10} /> {new Date().toLocaleTimeString()}</div>
                                    </div>
                                </div>

                                <div className="absolute top-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white mono-tech text-right">
                                    <div className="text-xl font-black">{feeds[activeFeed].type}</div>
                                    <div className="text-[10px] opacity-60">BITRATE: {bitrate}MB/S</div>
                                </div>

                                {/* Target Analysis */}
                                <div className="absolute top-1/4 left-1/3 w-48 h-48 border border-[#0EA5E9]/50 rounded-xl animate-pulse flex items-center justify-center">
                                    <div className="absolute -top-6 left-0 bg-[#0EA5E9] text-white px-3 py-1 text-[8px] font-black rounded uppercase">Scanning Area...</div>
                                    <div className="w-1 h-20 bg-[#0EA5E9]/20" />
                                    <div className="h-1 w-20 bg-[#0EA5E9]/20" />
                                </div>

                                {/* Movement Tracker */}
                                <div className="absolute bottom-12 right-12 flex gap-4">
                                     <div className="p-4 bg-green-500/20 backdrop-blur border border-green-500/30 rounded-xl text-green-400 mono-tech text-[8px] font-black">
                                        OBJECTS: 0
                                     </div>
                                     <div className="p-4 bg-sky-500/20 backdrop-blur border border-sky-500/30 rounded-xl text-sky-400 mono-tech text-[8px] font-black">
                                        MOTION: IDLE
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                            {[
                                { icon: <Activity />, label: 'THROUGHPUT', val: '840 GB/day' },
                                { icon: <Database />, label: 'REDUNDANCY', val: '99.99%' },
                                { icon: <Binary />, label: 'LATENCY', val: feeds[activeFeed].latency },
                                { icon: <Network />, label: 'NODES_UP', val: '24 nodes' }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-[#0EA5E9] transition-all">
                                    <div className="text-[#0EA5E9] mb-4">{stat.icon}</div>
                                    <div className="mono-tech text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">{stat.label}</div>
                                    <div className="text-xl font-black text-slate-900">{stat.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Grid Select */}
                    <div className="lg:w-4/12 space-y-8">
                        <div className="p-10 bg-slate-950 rounded-[50px] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9]/20 blur-[80px] rounded-full" />
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight uppercase">GRID_SELECTOR</h3>
                                    <p className="text-slate-400 text-[10px] mono-tech tracking-widest leading-relaxed">Select active surveillance node for detailed telemetry analysis.</p>
                                </div>

                                <div className="space-y-4">
                                    {feeds.map((feed, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveFeed(i)}
                                            className={`w-full p-6 rounded-[30px] border flex items-center justify-between transition-all group ${activeFeed === i ? 'bg-white text-slate-900 border-white shadow-xl scale-105' : 'bg-white/5 border-white/10 hover:border-white/30 text-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeFeed === i ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-white/10 text-white group-hover:bg-[#0EA5E9]'}`}>
                                                    <Video size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="mono-tech text-[9px] font-black uppercase opacity-60 mb-1">{feed.id}</p>
                                                    <p className={`text-sm font-black ${activeFeed === i ? 'text-slate-900' : 'text-slate-100'}`}>{feed.location}</p>
                                                </div>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${activeFeed === i ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                                        </button>
                                    ))}
                                </div>

                                <button className="w-full py-6 bg-[#0EA5E9] hover:bg-sky-600 rounded-2xl font-black uppercase tracking-[0.5em] text-[10px] transition-all shadow-xl shadow-[#0EA5E9]/20 active:scale-95 flex items-center justify-center gap-3">
                                    <ShieldCheck size={16} /> INITIALIZE_FULL_GRID
                                </button>
                            </div>
                        </div>

                        {/* System Log */}
                        <div className="p-8 bg-slate-50 border border-sky-50 rounded-[40px] space-y-6">
                            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                                <span className="mono-tech text-[9px] font-black text-[#0EA5E9] tracking-widest">SYSTEM_LOG_REALTIME</span>
                                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            </div>
                            <div className="space-y-4 h-[200px] overflow-y-auto pr-4 scrollbar-hide">
                                 {[
                                    'Link established with NODE_01...',
                                    'AES-256 Tunnel active.',
                                    'Movement detected in PARKING_B2.',
                                    'Bitrate stabilized at 42MB/s.',
                                    'Neural analysis complete: 0 threats.',
                                    'Node_04 battery at 100%.',
                                    'Cloud sync synchronized with Storage_01.'
                                 ].map((log, i) => (
                                     <div key={i} className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                                         <span className="mono-tech text-[8px] font-black text-[#0EA5E9] mt-1">[{i+12}:42]</span>
                                         <p className="text-[10px] font-bold text-slate-500">{log}</p>
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CXFooter />
        </div>
    );
};

export default LiveDemo;
