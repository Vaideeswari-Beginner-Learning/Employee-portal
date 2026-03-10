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
        <div className="min-h-screen bg-sky-50 p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-slate-800 border-red-400' : 'bg-emerald-500/90 text-slate-800 border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-5xl font-display font-black tracking-tight leading-none text-slate-800 uppercase">
                        Field<span className="text-sky-500 italic">.Ops</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-5 ml-1">Geospatial Intelligence Engine [Active]</p>
                </div>
                <div className="bg-white/50 backdrop-blur-xl px-8 py-5 rounded-[2rem] flex items-center gap-5 border border-sky-100 shadow-2xl">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-sky-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`} />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                            {isTracking ? 'Transmission Active' : 'Signal Standby'}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                            {isTracking ? 'Encrypted Stream' : 'Awaiting Deployment'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto relative">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="bg-white/50 backdrop-blur-xl p-16 rounded-[4rem] relative overflow-hidden group shadow-2xl border border-sky-100">
                    <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 scale-[2.5] rotate-12">
                        <Navigation size={120} className="text-sky-500" />
                    </div>

                    <div className="text-center space-y-16 relative z-10">
                        <div className="flex flex-col items-center gap-10">
                            <motion.div
                                animate={isTracking ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${isTracking ? 'bg-sky-500 shadow-2xl shadow-sky-600/30 border border-sky-400/30' : 'bg-sky-50 shadow-inner border border-sky-100'}`}
                            >
                                <Navigation size={48} className={isTracking ? 'text-slate-800' : 'text-slate-700'} />
                            </motion.div>
                            <div>
                                <h2 className="text-7xl font-display font-black text-slate-800 tracking-tighter tabular-nums leading-none">
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
                                    className="px-16 py-6 bg-sky-500 text-slate-800 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.35em] shadow-2xl shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-4 group border border-sky-400/20"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />}
                                    Initiate Scan
                                </button>
                            ) : (
                                <button
                                    onClick={stopTracking}
                                    disabled={loading}
                                    className="px-16 py-6 bg-sky-50 text-slate-800 border border-sky-100 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.35em] shadow-xl hover:bg-red-600 hover:border-red-500 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-4 group"
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
                                <div className="p-10 bg-sky-50 border border-sky-100 rounded-[3rem] shadow-2xl group/loc backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-4 mb-5">
                                        <MapPin size={20} className="text-sky-500 group-hover/loc:animate-bounce" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Current Geofence Node</p>
                                    </div>
                                    <p className="text-xl font-black text-slate-800 tracking-tight leading-relaxed max-w-xl mx-auto uppercase">
                                        {locationName}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-10">
                            <div className="bg-sky-50/50 rounded-3xl p-8 border border-sky-100">
                                <div className="flex items-start gap-6 text-left">
                                    <div className="p-4 bg-sky-500 text-slate-800 rounded-2xl shadow-lg shadow-sky-600/20 border border-sky-400/20">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.2em] mb-2">Protocol 4.0 Activation</p>
                                        <p className="text-[13px] font-bold text-slate-400 leading-relaxed max-w-md uppercase tracking-tight">
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


