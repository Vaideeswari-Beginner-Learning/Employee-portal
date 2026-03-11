import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlobalChat from '../../components/GlobalChat';
import { MessageSquare, Users, Shield, Briefcase } from 'lucide-react';

const TABS = [
    {
        id: 'admin',
        label: 'Admin Support',
        icon: <Shield size={14} />,
        description: 'Direct line to Admin',
        roomLabel: 'Admin Support Channel',
        color: 'blue',
    },
    {
        id: 'manager',
        label: 'Manager',
        icon: <Briefcase size={14} />,
        description: 'Message your manager',
        roomLabel: 'Manager Channel',
        color: 'violet',
    },
    {
        id: 'team',
        label: 'Team Chat',
        icon: <Users size={14} />,
        description: 'Group broadcast',
        roomLabel: 'Team Group Chat',
        color: 'indigo',
    },
];

const getRoomId = (tabId, userId) => {
    if (tabId === 'admin') return 'me';       // employee's own DM room (admin reads this)
    if (tabId === 'team') return 'team';      // team group room
    if (tabId === 'manager') return userId;   // same DM room â€” manager can open it by employee ID
    return 'me';
};

const SupportChat = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('admin');

    const currentTab = TABS.find(t => t.id === activeTab);
    const roomId = getRoomId(activeTab, user?._id);

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">
                        Comms<span className="text-primary-500">.Node</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        {currentTab?.description}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner gap-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const activeClasses = {
                            blue: 'bg-blue-600 text-slate-800 shadow-lg shadow-blue-500/20',
                            violet: 'bg-violet-600 text-slate-800 shadow-lg shadow-violet-500/20',
                            indigo: 'bg-sky-500 text-slate-800 shadow-lg shadow-sky-500/20',
                        };
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive
                                    ? activeClasses[tab.color]
                                    : 'text-slate-400 hover:text-slate-500 hover:bg-slate-200/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
                <GlobalChat
                    key={activeTab}
                    employeeId={roomId}
                    roomLabel={currentTab?.roomLabel}
                    recipient={activeTab}
                />
            </div>
        </div>
    );
};

export default SupportChat;


