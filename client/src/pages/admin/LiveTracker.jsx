import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, Users, Clock, Navigation, Search, RefreshCw, CheckCircle, ArrowUpRight, Trash2 } from 'lucide-react';

const POLL_INTERVAL = 10; // seconds

const LiveTracker = () => {
    const navigate = useNavigate();
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [countdown, setCountdown] = useState(POLL_INTERVAL);
    const [isDeleting, setIsDeleting] = useState(false);
    const prevCountRef = useRef(activeSessions.length);

    const fetchActiveSessions = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get('tracking/history');
            setActiveSessions(res.data);
            setLastRefresh(new Date());
            setCountdown(POLL_INTERVAL);
            prevCountRef.current = res.data.length;
        } catch (err) {
            console.error('Failed to fetch tracking history:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const handleDeleteSession = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to permanently delete this tracking session?")) return;

        setIsDeleting(true);
        try {
            await api.delete(`/tracking/${id}`);
            setActiveSessions(prev => prev.filter(s => s._id !== id));
            // alert("Session deleted successfully");
        } catch (err) {
            console.error('Failed to delete session:', err);
            alert("Failed to delete session");
        } finally {
            setIsDeleting(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchActiveSessions(false);
    }, [fetchActiveSessions]);

    // Silent background polling every 10 seconds
    useEffect(() => {
        const pollInterval = setInterval(() => fetchActiveSessions(true), POLL_INTERVAL * 1000);
        return () => clearInterval(pollInterval);
    }, [fetchActiveSessions]);

    // Countdown display (ticks every second)
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown(prev => (prev <= 1 ? POLL_INTERVAL : prev - 1));
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const filteredSessions = activeSessions.filter(s =>
        s.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = activeSessions.filter(s => s.status === 'active').length;

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-5xl font-display font-black tracking-tight leading-none text-white uppercase">
                        Operational<span className="text-indigo-500">.Pulse</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-5 ml-1">Central Geospatial Command Center</p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Live indicator + last sync + countdown */}
                    <div className="bg-slate-800/50 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center gap-5 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none">Last Sync</span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                                {lastRefresh.toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none">Next</span>
                            <span className="text-[9px] font-black text-indigo-400 tabular-nums mt-1">{countdown}s</span>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchActiveSessions(false)}
                        title="Refresh Now"
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-indigo-400 shadow-xl hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                <MetricCard
                    label="Personnel Active"
                    value={activeCount}
                    icon={<Activity className="text-emerald-500" />}
                    trend="Real-time Stream"
                    onClick={() => navigate('/admin/employees')}
                    hint="View Personnel"
                />
                <MetricCard
                    label="Operational History"
                    value={activeSessions.length}
                    icon={<Navigation className="text-indigo-500" />}
                    trend="Total Sessions"
                    onClick={() => document.getElementById('deployment-registry')?.scrollIntoView({ behavior: 'smooth' })}
                    hint="View Sessions"
                />
                <MetricCard
                    label="Geofence Status"
                    value="Secure"
                    icon={<MapPin className="text-blue-500" />}
                    trend="All Nodes Active"
                    onClick={() => {
                        const allSessions = activeSessions.filter(s => s.path?.length > 0);
                        if (allSessions.length > 0) {
                            const last = allSessions[0].path[allSessions[0].path.length - 1];
                            window.open(`https://www.google.com/maps?q=${last.latitude},${last.longitude}`, '_blank');
                        } else {
                            window.open('https://www.google.com/maps', '_blank');
                        }
                    }}
                    hint="Open Maps"
                />
                <MetricCard
                    label="Signal Strength"
                    value="98%"
                    icon={<CheckCircle className="text-indigo-500" />}
                    trend="+2.4% Optimal"
                    onClick={() => navigate('/admin-dashboard')}
                    hint="Go to Dashboard"
                />
            </div>

            <div className="max-w-7xl mx-auto space-y-8" id="deployment-registry">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Deployment Registry</h2>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-slate-400">{activeSessions.length} Records</span>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by Employee or Registry ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl text-[12px] font-bold text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none placeholder:text-slate-600 shadow-inner"
                        />
                    </div>
                </div>

                <div className="grid gap-6 pb-20">
                    <AnimatePresence mode="popLayout">
                        {filteredSessions.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-premium rounded-[2.5rem] border border-white/60 shadow-xl p-20 flex flex-col items-center justify-center gap-6 text-center"
                            >
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner">
                                    <Navigation size={40} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-base font-black text-slate-300 uppercase tracking-[0.3em]">
                                        {searchTerm ? 'No Matching Employees' : 'No Personnel Deployed'}
                                    </p>
                                    <p className="text-xs font-medium text-slate-300">
                                        {searchTerm
                                            ? `No results found for "${searchTerm}". Try a different name or ID.`
                                            : 'All field agents are currently off-duty. Sessions will appear here once field work begins.'}
                                    </p>
                                </div>
                                {!searchTerm && (
                                    <button
                                        onClick={fetchActiveSessions}
                                        className="px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <RefreshCw size={14} />
                                        Refresh Feed
                                    </button>
                                )}
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 hover:border-primary-200 transition-all shadow-sm"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </motion.div>
                        ) : filteredSessions.map((session) => {
                            const isLive = session.status === 'active';
                            const latestLocation = session.path && session.path.length > 0
                                ? session.path[session.path.length - 1]
                                : null;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={session._id}
                                    className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all group/card relative overflow-hidden"
                                >
                                    {isLive && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover/card:bg-emerald-500/10 transition-colors" />
                                    )}

                                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                        <div className="flex items-center gap-6 min-w-[280px]">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xl shadow-2xl border border-white/10">
                                                    {session.employee?.name?.charAt(0) || 'U'}
                                                </div>
                                                {isLive && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tight leading-none group-hover/card:text-indigo-400 transition-colors uppercase">
                                                    {session.employee?.name || 'Unknown Employee'}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                                                    ID: {session._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
                                            <TrackerStat
                                                label="Initialization"
                                                value={new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                subValue={new Date(session.startTime).toLocaleDateString()}
                                                icon={<Clock size={16} className="text-indigo-400" />}
                                            />
                                            <TrackerStat
                                                label={isLive ? "Active Node" : "End Point"}
                                                value={session.locationName || 'Calculating Area...'}
                                                subValue={latestLocation ? `${latestLocation.latitude.toFixed(4)}, ${latestLocation.longitude.toFixed(4)}` : ''}
                                                icon={<MapPin size={16} className="text-blue-400" />}
                                            />
                                            <TrackerStat
                                                label="Signal Metadata"
                                                value={isLive ? "Transmitting" : "Concluded"}
                                                subValue={isLive ? "Live Pulse" : `Ended ${session.endTime ? new Date(session.endTime).toLocaleTimeString() : ''}`}
                                                icon={<Activity size={16} className={isLive ? "text-emerald-400" : "text-slate-300"} />}
                                                valueClass={isLive ? "text-emerald-600 font-black" : "text-slate-400 font-bold"}
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-6 md:mt-0">
                                            <button
                                                onClick={() => {
                                                    if (!latestLocation) return;
                                                    const url = `https://www.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group/btn ${isLive ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700' : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 hover:text-slate-300'}`}
                                            >
                                                <Navigation size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                                Watch Path
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteSession(session._id, e)}
                                                disabled={isDeleting}
                                                className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                                title="Delete Session"
                                            >
                                                <Trash2 size={16} />
                                                <span className="sm:hidden">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, trend, onClick, hint }) => (
    <div
        onClick={onClick}
        className={`bg-slate-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:shadow-indigo-500/10 transition-all hover:translate-y-[-4px] group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Subtle hover glow */}
        {onClick && (
            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all rounded-[2.5rem]" />
        )}
        <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl shadow-sm text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-white/10">
                {icon}
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{trend}</span>
                {onClick && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{hint}</span>
                        <ArrowUpRight size={12} className="text-indigo-400" />
                    </div>
                )}
            </div>
        </div>
        <div className="space-y-1 relative z-10">
            <div className="text-4xl font-display font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors duration-300 uppercase">{value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
        </div>
    </div>
);

const TrackerStat = ({ label, value, subValue, icon, valueClass }) => (
    <div className="flex items-center gap-5 group/stat">
        <div className="p-3 bg-white/5 rounded-xl group-hover/stat:bg-white/10 transition-colors duration-300 border border-white/10">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className={`text-[13px] font-black tracking-tight truncate max-w-[180px] leading-tight ${valueClass || 'text-slate-100'}`}>
                {value}
            </p>
            {subValue && (
                <p className="text-[10px] font-bold text-slate-500 tracking-tighter mt-1">{subValue}</p>
            )}
        </div>
    </div>
);

export default LiveTracker;
