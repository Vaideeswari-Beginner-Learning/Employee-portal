import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, UploadCloud, MapPin, FileText, CheckCircle, Image as ImageIcon, Camera, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TaskDetailModal = ({ isOpen, onClose, task, onTaskUpdate }) => {
    const [isTiming, setIsTiming] = useState(task?.status === 'In Progress');
    const [timeElapsed, setTimeElapsed] = useState(task?.timeElapsed || 0);
    const [liveSessionMinutes, setLiveSessionMinutes] = useState(0);
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [reportFile, setReportFile] = useState(null);
    const [inspectionNotes, setInspectionNotes] = useState('');
    const [checklist, setChecklist] = useState(task?.inspectionChecklist || {
        cameraFocus: false,
        wiringIntact: false,
        powerSupply: false,
        dvrRecording: false
    });

    // Synchronize isTiming state with task.status updates from parent/backend
    useEffect(() => {
        setIsTiming(task?.status === 'In Progress');
        setTimeElapsed(task?.timeElapsed || 0);
    }, [task]);

    // Live Timer Effect
    useEffect(() => {
        let interval;
        if (isTiming && task?.lastStartTime) {
            const start = new Date(task.lastStartTime);
            interval = setInterval(() => {
                const now = new Date();
                const diffMs = now - start;
                setLiveSessionMinutes(Math.floor(diffMs / 1000)); // Storing seconds
            }, 1000); // 1 second frequency

            const diffMs = new Date() - start;
            setLiveSessionMinutes(Math.floor(diffMs / 1000));
        } else {
            setLiveSessionMinutes(0);
        }
        return () => clearInterval(interval);
    }, [isTiming, task?.lastStartTime]);

    const formatLiveTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins} mins ${secs}s`;
    };

    if (!isOpen || !task) return null;

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, upload to Coudinary/S3 here
        const fakeUrl = URL.createObjectURL(file);

        if (type === 'before') setBeforeImage(fakeUrl);
        else if (type === 'after') setAfterImage(fakeUrl);
        else setReportFile(file.name);

        toast.success(`Successfully attached ${type} file`);
    };

    const getCoordinates = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn("Geolocation not supported");
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.error("Geolocation error:", err);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    };

    const toggleTimer = async () => {
        const coords = await getCoordinates();
        const locationData = coords ? { ...coords, address: task.location } : null;

        if (!isTiming) {
            try {
                await api.put(`/tasks/${task._id}/status`, {
                    status: 'In Progress',
                    locationData
                });
                setIsTiming(true);
                toast.success("Task tracker started! GPS coordinates captured.");
                if (onTaskUpdate) onTaskUpdate();
            } catch (e) {
                console.error(e);
                toast.error("Failed to start tracker");
            }
        } else {
            try {
                // To stop, we transition status to 'Pending' (or another non-InProgress state)
                // which triggers the duration calculation in tasks.js.
                const res = await api.put(`/tasks/${task._id}/status`, {
                    status: 'Pending',
                    locationData
                });

                setIsTiming(false);
                setTimeElapsed(res.data.timeElapsed);
                setLiveSessionMinutes(0);
                toast.success("Task tracker stopped. Time logged accurately.");
                if (onTaskUpdate) onTaskUpdate();
            } catch (e) {
                console.error(e);
                toast.error("Failed to stop tracker");
            }
        }
    };

    const handleCompleteTask = async () => {
        try {
            await api.put(`/tasks/${task._id}/status`, {
                status: 'Awaiting Approval',
                timeElapsed,
                notes: inspectionNotes || 'No notes provided',
                inspectionChecklist: checklist
            });
            toast.success("Task marked as completed and sent for admin approval!");
            if (onTaskUpdate) onTaskUpdate();
            onClose();
        } catch (err) {
            console.error('Error completing task:', err);
            toast.error('Failed to submit task completion');
        }
    }

    const handleGenerateReviewLink = () => {
        const url = localStorage.getItem('reviewUrl');
        if (!url || url === 'https://g.page/r/your-google-review-link') {
            return toast.error("Please configure the Review URL in System Settings > Portal Config");
        }
        const message = `Hello! This is your ${task.taskType} partner. Thank you for your business. We would love to hear your feedback! Please leave a review here: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success("Review link generated and opened in WhatsApp!");
    };

    const FileUploadArea = ({ label, type, currentFile, icon, accept }) => (
        <label className="flex-1 relative group cursor-pointer">
            <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => handleFileUpload(e, type)}
            />
            <div className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${currentFile ? 'border-emerald-500/30 bg-emerald-50' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                {currentFile ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center px-4 truncate w-full">{currentFile.substring(currentFile.lastIndexOf('/') + 1) || 'File Uploaded'}</span>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-500 flex items-center justify-center transition-all shadow-sm">
                            {icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{label}</span>
                    </>
                )}
            </div>
        </label>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    layoutId={`task-${task.id}`}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full max-w-3xl max-h-[90vh] bg-white shadow-2xl rounded-[2rem] relative z-10 flex flex-col overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 flex items-start justify-between border-b border-slate-100 bg-white sticky top-0 z-20">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200/60' : 'bg-blue-50 text-blue-600 border-blue-200/60'}`}>
                                    {task.priority} Priority
                                </span>
                                <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200">
                                    {task.status}
                                </span>
                            </div>
                            <h2 className="text-3xl font-display font-black text-slate-900">{task.clientName}</h2>
                            <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                                <MapPin size={16} /> {task.location}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                        {/* Time Tracking */}
                        <section className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Time Logging</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleTimer}
                                    className={`px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold transition-all shadow-md ${isTiming ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20'}`}
                                >
                                    <Clock size={18} className={isTiming ? 'animate-pulse' : ''} />
                                    {isTiming ? 'Stop Tracker' : 'Start Task Tracker'}
                                </button>
                                <div className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                                    <span className="text-xs font-bold text-slate-500">Total Time Logged:</span>
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-lg font-black text-slate-900">
                                            {isTiming
                                                ? formatLiveTime(liveSessionMinutes)
                                                : `${timeElapsed} mins`
                                            }
                                        </span>
                                        {task.startLocation && (
                                            <a
                                                href={`https://www.google.com/maps?q=${task.startLocation.lat},${task.startLocation.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[9px] font-bold text-blue-500 underline flex items-center gap-1 mt-1"
                                            >
                                                <MapPin size={8} /> View Check-in Map
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Conditional Media/Documentation based on Task Type */}
                        {(task.taskType === 'Maintenance' || task.taskType === 'Repair') && (
                            <section>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Site Documentation</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FileUploadArea
                                        label="Before Service Photo"
                                        type="before"
                                        currentFile={beforeImage}
                                        icon={<Camera size={24} />}
                                        accept="image/*"
                                    />
                                    <FileUploadArea
                                        label="After Service Photo"
                                        type="after"
                                        currentFile={afterImage}
                                        icon={<ImageIcon size={24} />}
                                        accept="image/*"
                                    />
                                </div>
                            </section>
                        )}

                        {task.taskType === 'Installation' && (
                            <section>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Installation Proof</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <FileUploadArea
                                        label="Final Installation Photo"
                                        type="after"
                                        currentFile={afterImage}
                                        icon={<Camera size={24} />}
                                        accept="image/*"
                                    />
                                </div>
                            </section>
                        )}

                        {task.taskType === 'Inspection' && (
                            <section>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Inspection Checklist</h3>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                                    {Object.keys(checklist).map((key) => (
                                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={checklist[key]}
                                                onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            />
                                            <span className="text-sm font-bold text-slate-700 capitalize group-hover:text-blue-600 transition-colors">
                                                {key.replace(/([A-Z])/g, ' $1').trim()} Confirmed
                                            </span>
                                        </label>
                                    ))}
                                    <textarea
                                        placeholder="Add inspection notes here..."
                                        value={inspectionNotes}
                                        onChange={(e) => setInspectionNotes(e.target.value)}
                                        className="w-full mt-4 bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors resize-none h-24 shadow-sm"
                                    />
                                </div>
                            </section>
                        )}



                        {/* Report & Completion */}
                        <section className="pt-6 border-t border-slate-100">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Finalization</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FileUploadArea
                                    label="Upload Field Report PDF"
                                    type="report"
                                    currentFile={reportFile}
                                    icon={<FileText size={24} />}
                                    accept=".pdf,.doc,.docx"
                                />
                                <div className="flex-1 flex flex-col gap-3 justify-end">
                                    <button
                                        className="w-full h-12 rounded-xl bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-200 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        onClick={handleGenerateReviewLink}
                                    >
                                        <Share2 size={16} />
                                        Share Review Link
                                    </button>
                                    <button
                                        className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                        onClick={handleCompleteTask}
                                    >
                                        <CheckCircle size={20} />
                                        Complete Task
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskDetailModal;
