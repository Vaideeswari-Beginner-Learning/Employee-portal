import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, UserCircle, MessageSquare, Users } from 'lucide-react';
import GlobalChat from '../../components/GlobalChat';

const AdminComms = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('admin/employees');
            setEmployees(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to fetch employee roster');
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Comms<span className="text-sky-500">.Center</span></h1>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.4em]">Global Support & Direct Messaging</p>
            </div>

            <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2rem] shadow-2xl flex overflow-hidden">
                {/* Left Pane - Roster */}
                <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-sky-100 bg-sky-50/30 flex flex-col h-full">
                    <div className="p-4 border-b border-sky-100 bg-sky-50/50 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-white/50 text-sm text-slate-800 font-bold rounded-xl border border-sky-100 outline-none focus:border-sky-500 focus:bg-white transition-colors placeholder:text-slate-500 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {/* Team Group Chat Entry */}
                        <div
                            onClick={() => setSelectedEmployee({ _id: 'team', name: 'Team Group Chat', email: 'All Departments' })}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedEmployee?._id === 'team'
                                ? 'bg-sky-500 text-slate-800 border-sky-700 shadow-lg shadow-sky-600/20'
                                : 'bg-sky-50 border-sky-100 text-slate-800 hover:bg-sky-100 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${selectedEmployee?._id === 'team' ? 'bg-white/20 text-slate-800' : 'bg-sky-500/10 text-sky-500'}`}>
                                    <Users size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-black truncate uppercase tracking-tight">Team Group Chat</h4>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] truncate mt-0.5 ${selectedEmployee?._id === 'team' ? 'text-indigo-100' : 'text-sky-500'}`}>
                                        Internal Broadcast
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-sky-50 my-4 mx-2" />

                        {loading ? (
                            <p className="text-center text-sm font-bold text-slate-400 mt-10 animate-pulse">Scanning Roster...</p>
                        ) : filteredEmployees.length === 0 ? (
                            <p className="text-center text-sm font-bold text-slate-400 mt-10">No personnel found.</p>
                        ) : (
                            filteredEmployees.map(emp => (
                                <div
                                    key={emp._id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedEmployee?._id === emp._id
                                        ? 'bg-sky-500 text-slate-800 border-sky-600 shadow-lg shadow-sky-600/20'
                                        : 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-slate-800'
                                        }`}
                                >
                                    {/* Display name: use name if set, else use email prefix */}
                                    {(() => {
                                        const displayName = emp.name?.trim() || emp.email?.split('@')[0] || 'Unknown';
                                        const initial = displayName.charAt(0).toUpperCase();
                                        return (
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${selectedEmployee?._id === emp._id ? 'bg-white/20 text-slate-800' : 'bg-sky-50 text-slate-400 border border-sky-100 shadow-inner'}`}>
                                                    {initial}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-black truncate uppercase tracking-tight">{displayName}</h4>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest truncate mt-0.5 ${selectedEmployee?._id === emp._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                        {emp.employeeId || emp.email || 'STAFF'}
                                                    </p>
                                                </div>
                                                <MessageSquare size={16} className={selectedEmployee?._id === emp._id ? 'text-white/50' : 'text-slate-700'} />
                                            </div>
                                        );
                                    })()}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane - Chat Hub */}
                <div className="flex-1 h-full bg-sky-50 relative">
                    {selectedEmployee ? (
                        <div className="h-full flex flex-col relative w-full pt-16">
                            <div className="absolute top-0 left-0 w-full bg-sky-50/50 backdrop-blur-xl border-b border-sky-100 p-4 shrink-0 flex items-center gap-3 z-20 h-16">
                                {(() => {
                                    const displayName = selectedEmployee.name?.trim() || selectedEmployee.email?.split('@')[0] || 'Unknown';
                                    const initial = displayName.charAt(0).toUpperCase();
                                    return (
                                        <>
                                            <div className="w-8 h-8 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-lg flex items-center justify-center font-black">
                                                {initial}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight">{displayName}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{selectedEmployee.email}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {/* Pass selectedEmployee._id to the global chat, and don't render its own inner header inside it */}
                            <div className="flex-1 overflow-hidden [&>div]:h-full [&>div>div:first-child]:hidden">
                                <GlobalChat employeeId={selectedEmployee._id} recipient="admin" />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
                            <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mb-6 border border-sky-100 shadow-2xl">
                                <MessageSquare size={32} className="text-sky-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">Select a Node</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-slate-500">Choose personnel from the roster to initiate comms.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminComms;


