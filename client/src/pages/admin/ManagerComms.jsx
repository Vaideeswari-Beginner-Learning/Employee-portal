import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, MessageSquare, Users, UserCircle, Briefcase } from 'lucide-react';
import GlobalChat from '../../components/GlobalChat';

const ManagerComms = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const load = async () => {
            await fetchEmployees();
        };
        load();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] p-4 sm:p-0">
            <div className="mb-6 shrink-0">
                <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Team<span className="text-sky-500">.Comms</span></h1>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.4em]">Manager Communication Hub</p>
            </div>

            <div className="flex-1 min-h-0 relative p-[3px] rounded-[2rem] shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)] flex group overflow-hidden">
                {/* Animated Colorful Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
                
                {/* Inner Content */}
                <div className="relative flex-1 bg-white/90 backdrop-blur-2xl rounded-[calc(2rem-3px)] flex overflow-hidden z-10 w-full h-full border border-white/50">
                {/* Left Pane - Roster */}
                <div className={`${selectedEmployee ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 md:min-w-[280px] md:max-w-[380px] border-r border-sky-100 bg-sky-50/30 flex-col h-full`}>
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
                            onClick={() => setSelectedEmployee({ _id: 'team', name: 'Team Group Chat', email: 'All Departments', isTeam: true })}
                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border active:scale-95 group ${selectedEmployee?._id === 'team'
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)]'
                                : 'bg-white/60 border-sky-100 text-slate-800 hover:bg-sky-50 hover:border-sky-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-110 ${selectedEmployee?._id === 'team' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-500 group-hover:bg-sky-500 group-hover:text-white'}`}>
                                    <Users size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${selectedEmployee?._id === 'team' ? 'text-white' : 'group-hover:text-sky-600'}`}>Team Group Chat</h4>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] truncate mt-0.5 ${selectedEmployee?._id === 'team' ? 'text-sky-100' : 'text-slate-400 group-hover:text-sky-400'}`}>
                                        Internal Broadcast
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-sky-50 my-4 mx-2" />

                        <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Direct Messages</p>

                        {loading ? (
                            <p className="text-center text-sm font-bold text-slate-400 mt-10 animate-pulse">Scanning Roster...</p>
                        ) : filteredEmployees.length === 0 ? (
                            <p className="text-center text-sm font-bold text-slate-400 mt-10">No personnel found.</p>
                        ) : (
                            filteredEmployees.map(emp => (
                                <div
                                    key={emp._id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border active:scale-95 group ${selectedEmployee?._id === emp._id
                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)]'
                                        : 'bg-white/60 hover:bg-sky-50 border-sky-100 hover:border-sky-300 text-slate-800 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${selectedEmployee?._id === emp._id ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-500 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white group-hover:border-transparent'}`}>
                                            {emp.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${selectedEmployee?._id === emp._id ? 'text-white' : 'group-hover:text-sky-600'}`}>{emp.name}</h4>
                                            <p className={`text-[10px] font-black uppercase tracking-widest truncate mt-0.5 ${selectedEmployee?._id === emp._id ? 'text-sky-100' : 'text-slate-400 group-hover:text-sky-400'}`}>
                                                {emp.employeeId || emp.role?.toUpperCase() || 'STAFF'}
                                            </p>
                                        </div>
                                        <MessageSquare size={16} className={`transition-all group-hover:scale-110 ${selectedEmployee?._id === emp._id ? 'text-white/50' : 'text-slate-300 group-hover:text-sky-500'}`} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={`${selectedEmployee ? 'flex' : 'hidden md:flex'} flex-1 h-full bg-sky-50 relative overflow-hidden`}>
                    {selectedEmployee ? (
                        <div className="h-full flex flex-col relative w-full pt-16">
                            <div className="absolute top-0 left-0 w-full bg-sky-50/50 backdrop-blur-xl border-b border-sky-100 p-4 shrink-0 flex items-center gap-3 z-20 h-16">
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-sky-500 transition-colors active:scale-95"
                                >
                                    <Users size={20} />
                                </button>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black shadow-sm ${selectedEmployee.isTeam ? 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white' : 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white'}`}>
                                    {selectedEmployee.isTeam ? <Users size={16} /> : (selectedEmployee.name || '?').charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight truncate">{selectedEmployee.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1 truncate">
                                        {selectedEmployee.isTeam ? 'Group Broadcast' : selectedEmployee.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden [&>div]:h-full [&>div>div:first-child]:hidden">
                                <GlobalChat
                                    employeeId={selectedEmployee._id}
                                    roomLabel={selectedEmployee.isTeam ? 'Team Channel' : selectedEmployee.name}
                                    recipient={selectedEmployee.isTeam ? 'team' : 'employee'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10 w-full animate-fade-scale">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent pointer-events-none" />
                            <div className="w-24 h-24 bg-gradient-to-br from-white to-sky-50 rounded-[2rem] flex items-center justify-center mb-8 border border-sky-100 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)] animate-float">
                                <MessageSquare size={40} className="text-sky-500 drop-shadow-md" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-sky-700">Select a Contact</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-slate-500 max-w-xs text-center">Choose a team member or the group chat to start messaging.</p>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerComms;


