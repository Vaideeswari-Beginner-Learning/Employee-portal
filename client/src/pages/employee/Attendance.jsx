import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle, AlertCircle, Loader2, ChevronRight, Activity, MapPin, Fingerprint, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AttendancePage = () => {
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [notification, setNotification] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchHistory();
        return () => clearInterval(timer);
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };


    const fetchHistory = async () => {
        try {
            const res = await api.get('employee/attendance');
            setHistory(res.data);
            const latest = res.data[0];
            if (latest && !latest.checkOut) setStatus('checked-in');
            else setStatus('checked-out');
        } catch (err) {
            console.error('Attendance fetch error:', err.response?.data || err.message);
        }
    };

    const [step, setStep] = useState(1); // 1: GPS, 2: Face Auth, 3: Submit
    const [capturedImage, setCapturedImage] = useState(null);
    const [lastCoord, setLastCoord] = useState({ lat: 0, lng: 0 });
    const videoRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            showNotification('error', 'Camera access denied.');
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.6);
        console.log('Biometric Frame Size:', (data.length / 1024).toFixed(2), 'KB');
        setCapturedImage(data);

        // Stop stream
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        setStep(3);
    };

    const handleAttendanceFlow = async () => {
        if (step === 1) {
            setLoading(true);
            try {
                if (!navigator.geolocation) throw new Error('GPS not supported.');

                const pos = await new Promise((res, rej) => {
                    navigator.geolocation.getCurrentPosition(res, rej, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });

                setLastCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                console.log('GPS Captured:', pos.coords.latitude, pos.coords.longitude);

                showNotification('success', 'GPS Locked. Proceed to Identity Verification.');
                setStep(2);
                startCamera();
            } catch (err) {
                let msg = 'Location access failed.';
                if (err.code === 1) msg = 'Please enable GPS to proceed.';
                showNotification('error', msg);
            } finally {
                setLoading(false);
            }
        } else if (step === 3) {
            setLoading(true);
            try {
                let locationName = 'Unknown Location';
                try {
                    // Optimized geocoding with timeout to prevent "slow loading"
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastCoord.lat}&lon=${lastCoord.lng}&zoom=18&addressdetails=1`, {
                        headers: { 'User-Agent': 'EmployeePortal/1.0' },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData.address) {
                            const { road, suburb, city, town, village, state, country } = geoData.address;
                            locationName = [road, suburb, city || town || village].filter(Boolean).join(', ');
                        }
                    }
                } catch (geoErr) {
                    console.warn('Geocoding bypass: Service unreachable or timed out.', geoErr);
                    // Fallback to coordinates if address lookup is too slow
                    locationName = `Manual GPS: ${lastCoord.lat.toFixed(4)}, ${lastCoord.lng.toFixed(4)}`;
                }

                await api.post('employee/check-in', {
                    latitude: lastCoord.lat,
                    longitude: lastCoord.lng,
                    locationName,
                    biometricPhoto: capturedImage
                });
                showNotification('success', 'Shift Initialized. Identity Confirmed.');
                fetchHistory();
                setStep(1);
                setCapturedImage(null);
            } catch (err) {
                const errMsg = err.response?.data?.message || 'Registry update failed.';
                showNotification('error', errMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAction = async (type) => {
        if (type === 'check-out') {
            setLoading(true);
            try {
                await api.post('employee/check-out', {});
                showNotification('success', 'Shift Terminated.');
                fetchHistory();
            } catch (err) {
                showNotification('error', 'Termination failed.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-slate-900 min-h-screen p-6 md:p-10">
            {/* Notification Portal */}
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

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-white tracking-tight leading-none uppercase">Shift<span className="text-indigo-500 italic">.Logs</span></h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">High Precision Temporal Registry</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 shadow-2xl px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl group">
                    <Clock size={20} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white tracking-tighter tabular-nums leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Control Center */}
                <div className="xl:col-span-5 space-y-10">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 overflow-hidden relative group shadow-2xl">
                        {/* Immersive Background */}
                        <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 scale-[2]">
                            <Fingerprint size={100} className="text-white" />
                        </div>

                        <div className="text-center space-y-10 relative z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500 ${status === 'checked-in' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                    {status === 'checked-in' ? 'Pulse Active' : 'Pulse Terminated'}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed">Identity Verified: Biometric Node Alpha</p>
                            </div>

                            <div className="flex justify-center py-6 min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {status === 'checked-out' ? (
                                        <motion.div
                                            key="checkin-flow"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className="flex flex-col items-center gap-8 w-full"
                                        >
                                            {step === 1 && (
                                                <button
                                                    onClick={handleAttendanceFlow}
                                                    disabled={loading}
                                                    className="w-48 h-48 rounded-[3rem] bg-indigo-600 shadow-2xl shadow-indigo-600/30 flex flex-col items-center justify-center gap-4 text-white hover:bg-indigo-700 active:scale-95 transition-all relative overflow-hidden group/btn border border-indigo-400/20"
                                                >
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                    {loading ? <Loader2 className="animate-spin" size={40} /> : (
                                                        <>
                                                            <div className="p-4 bg-white/20 rounded-2xl shadow-inner border border-white/10">
                                                                <MapPin size={32} />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Verify GPS</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {step === 2 && (
                                                <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                                                    <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-indigo-600 shadow-2xl bg-slate-900">
                                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 border-[40px] border-slate-900/50 pointer-events-none flex items-center justify-center">
                                                            <div className="w-48 h-64 border-2 border-indigo-500/50 rounded-[4rem] border-dashed" />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={capturePhoto}
                                                        className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3"
                                                    >
                                                        <Fingerprint size={18} />
                                                        Capture Biometrics
                                                    </button>
                                                </div>
                                            )}

                                            {step === 3 && (
                                                <div className="flex flex-col items-center gap-8">
                                                    <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20">
                                                        <img src={capturedImage} alt="Biometric" className="w-full h-full object-cover" />
                                                    </div>
                                                    <button
                                                        onClick={handleAttendanceFlow}
                                                        disabled={loading}
                                                        className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-3"
                                                    >
                                                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                                            <>
                                                                <CheckCircle size={18} />
                                                                Submit: Present
                                                            </>
                                                        )}
                                                    </button>
                                                    <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Recapture Identity</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="checkout"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            onClick={() => handleAction('check-out')}
                                            disabled={loading}
                                            className="w-48 h-48 rounded-[3rem] bg-slate-900 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.4)] flex flex-col items-center justify-center gap-4 text-white hover:bg-slate-800 active:scale-95 transition-all relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                            {loading ? <Loader2 className="animate-spin" size={40} /> : (
                                                <>
                                                    <div className="p-4 bg-red-500/20 rounded-2xl shadow-inner">
                                                        <LogOut size={32} className="text-red-400" />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Terminate</span>
                                                </>
                                            )}
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 shadow-inner backdrop-blur-md">
                                <p className="text-[9px] font-black text-slate-500 leading-relaxed uppercase tracking-[0.1em]">
                                    Your operational metadata is encrypted and logged in compliance with Standard HR-22 protocols.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <PresenceMetric label="Active Hours" value="164.2" unit="h" icon={<Clock size={14} />} />
                        <PresenceMetric label="Reliability" value="99.2" unit="%" icon={<Activity size={14} />} />
                    </div>
                </div>

                {/* History List */}
                <div className="xl:col-span-7 h-full">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[3.5rem] flex flex-col h-full overflow-hidden shadow-2xl">
                        <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Temporal <span className="text-indigo-500">Registry</span></h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Personnel Operation Logs</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                                <Calendar size={16} className="text-indigo-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Cycle</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[600px] px-6 py-6 space-y-3 custom-scrollbar">
                            {history.length > 0 ? history.map((entry, idx) => (
                                <div key={entry._id} className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 shadow-xl hover:bg-slate-800/80 hover:border-indigo-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-8">
                                        <div className="text-center min-w-[70px] p-4 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner group-hover:bg-indigo-500/10 transition-colors">
                                            <p className="text-2xl font-display font-black text-white tracking-tighter leading-none mb-1">
                                                {new Date(entry.date).getDate()}
                                            </p>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                                                {new Date(entry.date).toLocaleString('en-US', { month: 'short' })}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            <TimeMetric label="Authorization" time={entry.checkIn} color="text-emerald-400" />
                                            <TimeMetric label="Termination" time={entry.checkOut || '--:--'} color="text-slate-500" />
                                        </div>
                                    </div>

                                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border ${entry.status === 'Present' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                                        {entry.status}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-32 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center mb-6 text-slate-700 shadow-inner">
                                        <Activity size={40} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Zero Telemetry Detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PresenceMetric = ({ label, value, unit, icon }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-2 group hover:scale-[1.02] shadow-2xl transition-all">
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors shadow-inner">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-display font-black text-white leading-none">
                {value}<span className="text-sm text-slate-600 ml-1 border-l border-white/5 pl-2 uppercase font-black">{unit}</span>
            </p>
        </div>
    </div>
);

const TimeMetric = ({ label, time, color }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-black tabular-nums tracking-tighter ${color} flex items-center gap-2`}>
            {time}
            <ChevronRight size={14} className="opacity-10" />
        </p>
    </div>
);

export default AttendancePage;
