import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, UserCircle, MessageSquare } from 'lucide-react';
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
            const res = await api.get('/admin/employees');
            setEmployees(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to fetch employee roster');
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Comms Center</h1>
                <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">Global Support & Direct Messaging</p>
            </div>

            <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-slate-200/40 flex overflow-hidden">
                {/* Left Pane - Roster */}
                <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-slate-200 bg-slate-50/50 flex flex-col h-full">
                    <div className="p-4 border-b border-slate-200 bg-white z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 text-sm text-slate-700 font-bold rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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
                                            {emp.firstName?.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold truncate">{emp.firstName} {emp.lastName}</h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-0.5 ${selectedEmployee?._id === emp._id ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {emp.employeeId || 'STAFF'}
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
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black">
                                    {selectedEmployee.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 leading-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{selectedEmployee.email}</p>
                                </div>
                            </div>
                            {/* Pass selectedEmployee._id to the global chat, and don't render its own inner header inside it */}
                            <div className="flex-1 overflow-hidden [&>div]:h-full [&>div>div:first-child]:hidden">
                                <GlobalChat employeeId={selectedEmployee._id} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <MessageSquare size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Select a Node</h3>
                            <p className="text-sm font-medium mt-1">Choose personnel from the roster to initiate comms.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminComms;
