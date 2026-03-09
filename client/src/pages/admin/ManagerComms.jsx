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
                <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Team Comms</h1>
                <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">Manager Communication Hub</p>
            </div>

            <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-slate-200/40 flex overflow-hidden">
                {/* Left Pane - Roster */}
                <div className="w-1/3 min-w-[280px] max-w-[380px] border-r border-slate-200 bg-slate-50/50 flex flex-col h-full">
                    <div className="p-4 border-b border-slate-200 bg-white z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 text-sm text-slate-700 font-bold rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {/* Team Group Chat Entry */}
                        <div
                            onClick={() => setSelectedEmployee({ _id: 'team', name: 'Team Group Chat', email: 'All Departments', isTeam: true })}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedEmployee?._id === 'team'
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/20'
                                : 'bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-100 hover:to-slate-50 border-indigo-100 text-slate-800 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedEmployee?._id === 'team' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <Users size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-black truncate">Team Group Chat</h4>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-0.5 ${selectedEmployee?._id === 'team' ? 'text-indigo-100' : 'text-indigo-400'}`}>
                                        Internal Broadcast
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 my-4 mx-2" />

                        <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Direct Messages</p>

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
                                        ? 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${selectedEmployee?._id === emp._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {emp.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold truncate">{emp.name}</h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-0.5 ${selectedEmployee?._id === emp._id ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {emp.employeeId || emp.role?.toUpperCase() || 'STAFF'}
                                            </p>
                                        </div>
                                        <MessageSquare size={16} className={selectedEmployee?._id === emp._id ? 'text-white/50' : 'text-slate-300'} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane - Chat Hub */}
                <div className="flex-1 h-full bg-slate-50 relative">
                    {selectedEmployee ? (
                        <div className="h-full flex flex-col relative w-full pt-16">
                            <div className="absolute top-0 left-0 w-full bg-white border-b border-slate-200 p-4 shrink-0 flex items-center gap-3 z-20 h-16">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${selectedEmployee.isTeam ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {selectedEmployee.isTeam ? <Users size={16} /> : selectedEmployee.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 leading-tight">{selectedEmployee.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {selectedEmployee.isTeam ? 'Group Broadcast' : selectedEmployee.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden [&>div]:h-full [&>div>div:first-child]:hidden">
                                <GlobalChat
                                    employeeId={selectedEmployee._id}
                                    roomLabel={selectedEmployee.isTeam ? 'Team Channel' : selectedEmployee.name}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <MessageSquare size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Select a Contact</h3>
                            <p className="text-sm font-medium mt-1">Choose a team member or the group chat to start messaging.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerComms;
