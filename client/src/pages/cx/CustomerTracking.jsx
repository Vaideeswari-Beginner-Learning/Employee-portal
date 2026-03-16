import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, Package, Clock, CheckCircle, AlertCircle, User, ArrowLeft } from 'lucide-react';
import CXNavbar from './Navbar';
import CXFooter from './Footer';
import api from '../../utils/api';

const CustomerTracking = () => {
    const [searchParams] = useSearchParams();
    const [requestId, setRequestId] = useState(searchParams.get('id') || '');
    const [requestData, setRequestData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const statusSteps = ['Started', 'In Progress', 'Pending', 'Completed'];

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!requestId) return;
        
        setIsLoading(true);
        setError('');
        try {
            const res = await api.get(`cx/track/${requestId}`);
            setRequestData(res.data);
        } catch (err) {
            setError('Invalid Protocol ID. Please verify your credentials.');
            setRequestData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (requestId) handleTrack();
    }, []);

    const getStatusIndex = (status) => statusSteps.indexOf(status);

    return (
        <div className="min-h-screen bg-white">
            <CXNavbar />
            
            <main className="max-w-7xl mx-auto px-4 pt-40 pb-32">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12 text-center">
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-4 block">Protocol Monitoring</span>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8 italic">Service Tracking</h1>
                        
                        <form onSubmit={handleTrack} className="relative group max-w-md mx-auto">
                            <input 
                                type="text" 
                                placeholder="Enter Protocol ID (e.g. SR-1234)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-8 text-sm font-black focus:bg-white focus:border-sky-500 transition-all outline-none shadow-inner"
                                value={requestId}
                                onChange={(e) => setRequestId(e.target.value.toUpperCase())}
                            />
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-sky-500 transition-colors"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Synchronize'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-100 p-6 rounded-[2rem] text-center mb-8"
                        >
                            <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
                            <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
                        </motion.div>
                    )}

                    {requestData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Visual Status Bar */}
                            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-12">
                                    {statusSteps.map((step, i) => {
                                        const currentIndex = getStatusIndex(requestData.status);
                                        const isCompleted = i < currentIndex;
                                        const isActive = i === currentIndex;
                                        const isLast = i === statusSteps.length - 1;

                                        return (
                                            <div key={step} className="flex-1 flex flex-col items-center relative group">
                                                {/* Line */}
                                                {!isLast && (
                                                    <div className={`absolute left-1/2 top-4 w-full h-[2px] ${i < currentIndex ? 'bg-sky-500' : 'bg-slate-200'}`} />
                                                )}
                                                
                                                {/* Node */}
                                                <div className={`w-8 h-8 rounded-full border-2 relative z-10 flex items-center justify-center transition-all ${isActive ? 'bg-white border-sky-500 shadow-lg shadow-sky-100' : isCompleted ? 'bg-sky-500 border-sky-500' : 'bg-white border-slate-200'}`}>
                                                    {isCompleted ? <CheckCircle size={14} className="text-white" /> : isActive ? <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> : null}
                                                </div>
                                                
                                                <span className={`text-[9px] font-black uppercase tracking-widest mt-4 ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-slate-200/50">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Metadata</p>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Assigned Node</h4>
                                                <p className="text-sm font-medium text-slate-500">{requestData.productType || 'Standard Integration'}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Deployment Window</h4>
                                                <p className="text-sm font-medium text-slate-500">{new Date(requestData.preferredDate).toLocaleDateString()} @ {requestData.preferredTimeSlot}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Assigned Personnel</p>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                                                    {requestData.assignedEmployee?.name || 'Protocol Pending Assignment'}
                                                </h4>
                                                <p className="text-[10px] font-medium text-slate-400">Field Engineer Alpha</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!requestData && !isLoading && !error && (
                        <div className="text-center pt-20">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
                                <Package size={48} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">No Active Sequence Synced</h3>
                            <p className="text-sm text-slate-400 font-medium">Enter your unique Protocol ID to access the deployment grid.</p>
                        </div>
                    )}
                </div>
            </main>

            <CXFooter />
        </div>
    );
};

export default CustomerTracking;
