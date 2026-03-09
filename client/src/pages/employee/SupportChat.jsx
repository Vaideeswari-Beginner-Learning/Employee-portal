import { useAuth } from '../../context/AuthContext';
import GlobalChat from '../../components/GlobalChat';

const SupportChat = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            <div>
                <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Support Node</h1>
                <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">Direct Comms with Admin Team</p>
            </div>

            <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
                <GlobalChat employeeId="me" />
            </div>
        </div>
    );
};

export default SupportChat;
