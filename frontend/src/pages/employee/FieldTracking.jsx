import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, MapPin, Navigation, Activity, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTracking } from '../../context/TrackingContext';

const FieldTracking = () => {
    const {
        isTracking,
        loading,
        duration,
        notification,
        lastCoord,
        locationName,
        startTracking,
        stopTracking
    } = useTracking();

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen mesh-gradient-animated p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-emerald-500/90 text-white border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-5xl font-display font-black tracking-tight leading-none text-slate-900">
                        Field<span className="text-primary-500 italic">.Ops</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-5 ml-1">Geospatial Intelligence Engine [Active]</p>
                </div>
                <div className="glass-premium px-8 py-5 rounded-[2rem] flex items-center gap-5 border border-white/50 shadow-xl">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-primary-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`} />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                            {isTracking ? 'Transmission Active' : 'Signal Standby'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                            {isTracking ? 'Encrypted Stream' : 'Awaiting Deployment'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto relative">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="glass-premium p-16 rounded-[4rem] relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-white/80">
                    <div className="absolute top-0 right-0 p-24 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 scale-[2.5] rotate-12">
                        <Navigation size={120} className="text-slate-900" />
                    </div>

                    <div className="text-center space-y-16 relative z-10">
                        <div className="flex flex-col items-center gap-10">
                            <motion.div
                                animate={isTracking ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${isTracking ? 'bg-primary-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)]' : 'bg-slate-100 shadow-inner'}`}
                            >
                                <Navigation size={48} className={isTracking ? 'text-white' : 'text-slate-300'} />
                            </motion.div>
                            <div>
                                <h2 className="text-7xl font-display font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                    {formatTime(duration)}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-6">Mission Duration Registry</p>
                            </div>
                        </div>

                        <div className="flex justify-center flex-col sm:flex-row gap-8">
                            {!isTracking ? (
                                <button
                                    onClick={startTracking}
                                    disabled={loading}
                                    className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.35em] shadow-2xl shadow-slate-900/20 hover:bg-primary-500 hover:shadow-primary-500/30 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />}
                                    Initiate Scan
                                </button>
                            ) : (
                                <button
                                    onClick={stopTracking}
                                    disabled={loading}
                                    className="px-16 py-6 bg-white text-slate-900 border-2 border-slate-900/10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.35em] shadow-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Square size={20} className="group-hover:scale-90 transition-transform" fill="currentColor" />}
                                    Cease Signal
                                </button>
                            )}
                        </div>

                        {lastCoord && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-8"
                            >
                                <div className="p-10 bg-white/40 rounded-[3rem] border border-white/60 shadow-inner group/loc backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-4 mb-5">
                                        <MapPin size={20} className="text-primary-500 group-hover/loc:animate-bounce" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Current Geofence Node</p>
                                    </div>
                                    <p className="text-xl font-black text-slate-800 tracking-tight leading-relaxed max-w-xl mx-auto drop-shadow-sm">
                                        {locationName}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-10">
                            <div className="glass-premium rounded-3xl p-8 border border-white/40 bg-white/20">
                                <div className="flex items-start gap-6 text-left">
                                    <div className="p-4 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-primary-600 uppercase tracking-[0.2em] mb-2">Protocol 4.0 Activation</p>
                                        <p className="text-[13px] font-semibold text-slate-600 leading-relaxed max-w-md">
                                            Telemetry stream is established. Your location identity is verified and synchronized with the central repository every 30 seconds.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldTracking;
