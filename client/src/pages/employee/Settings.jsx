import { useState } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    Bell,
    Shield,
    Save,
    Camera,
    Eye,
    EyeOff,
    CheckCircle,
    UserCircle,
    Server,
    Smartphone,
    Mail,
    MapPin,
    Activity,
    AlertCircle,
    Globe,
    Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Identity');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [message, setMessage] = useState('');
    const [notificationPrefs, setNotificationPrefs] = useState(() => {
        const saved = localStorage.getItem('notificationPrefs');
        return saved ? JSON.parse(saved) : {
            attendance: true,
            leave: true,
            broadcasts: true,
            reports: false,
            fieldOps: true,
            security: true,
        };
    });

    const [portalConfig, setPortalConfig] = useState({
        cxUrl: localStorage.getItem('cxUrl') || '',
        reviewUrl: localStorage.getItem('reviewUrl') || ''
    });

    const handleSavePortalConfig = () => {
        if (portalConfig.cxUrl && !portalConfig.cxUrl.startsWith('http')) {
            return showNotification('error', 'Cx URL must start with http:// or https://');
        }
        if (portalConfig.reviewUrl && !portalConfig.reviewUrl.startsWith('http')) {
            return showNotification('error', 'Review URL must start with http:// or https://');
        }

        localStorage.setItem('cxUrl', portalConfig.cxUrl);
        localStorage.setItem('reviewUrl', portalConfig.reviewUrl);
        showNotification('success', 'Portal Configuration Synchronized Successfully.');
    };

    const togglePref = (key) => {
        setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveAlerts = () => {
        localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
        showNotification('success', 'Notification Preferences Saved Successfully.');
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileData, setProfileData] = useState({
        name: user?.name,
        email: user?.email,
        phone: user?.phone || '+91 XXXX-XXXXX'
    });


    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('error', "Authorization mismatch: Keys do not align.");
            return;
        }
        setLoading(true);
        try {
            await api.put('employee/change-password', passwordData);
            showNotification('success', 'Security Matrix Updated Successfully.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Update failure.');
        } finally {
            setLoading(false);
        }
    };
    const handleRequestAccess = () => {
        showNotification('info', "Broadcast Authorization Pending: Transmitted to Remote Authority.");
    };

    const handleIdentityUpdate = async () => {
        setLoading(true);
        try {
            await api.patch('/employee/profile', { phone: profileData.phone });
            showNotification('success', 'Identity Profile Updated Successfully.');
        } catch (err) {
            showNotification('error', 'Identity update failure.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { name: 'Identity', icon: <User size={16} /> },
        { name: 'Security', icon: <Lock size={16} /> },
        { name: 'Alerts', icon: <Bell size={16} /> },
        ...(user?.email === 'admin@cctv.com' ? [{ name: 'Portal Config', icon: <Globe size={16} /> }] : [])
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 bg-sky-50/50 p-6 md:p-10 rounded-[3rem] border border-sky-100 shadow-2xl">
            {/* Notification Portal */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-slate-800 border-red-400' : notification.type === 'info' ? 'bg-sky-50/90 text-slate-800 border-slate-700' : 'bg-emerald-500/90 text-slate-800 border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : notification.type === 'info' ? <Bell size={20} /> : <Shield size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight uppercase">Identity<span className="text-sky-500 italic">.Matrix</span></h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Manage personnel credentials and security protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeTab === tab.name
                                    ? 'bg-sky-500 text-slate-800 shadow-xl shadow-sky-600/20 border border-sky-400/20'
                                    : 'text-slate-400 hover:text-slate-800 hover:bg-sky-50'}`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === 'Identity' && (
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                                <UserCircle size={18} className="text-sky-500" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Profile Configuration</h2>
                            </div>
                            <div className="p-10 space-y-10">
                                <div className="flex items-center gap-8 border-b border-sky-100 pb-10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[2rem] bg-sky-50 border border-sky-100 overflow-hidden shadow-inner flex items-center justify-center">
                                            <div className="text-3xl font-black text-slate-700 uppercase">
                                                {user?.name?.charAt(0)}
                                            </div>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-3 bg-sky-500 border border-sky-400/30 rounded-2xl text-slate-800 shadow-xl transform active:scale-90 transition-all">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{user?.name}</p>
                                        <p className="text-[10px] text-sky-500 uppercase tracking-[0.2em] font-black">Sector Header: {user?.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <SettingsInput label="Authorized Name" value={profileData.name} readOnly />
                                    <SettingsInput label="Telemetry Contact (Phone)" value={profileData.phone} />
                                    <div className="md:col-span-2">
                                        <SettingsInput label="Primary Vector (Email)" value={profileData.email} icon={<Smartphone size={14} />} readOnly />
                                    </div>
                                </div>

                                <button
                                    onClick={handleIdentityUpdate}
                                    disabled={loading}
                                    className="px-10 py-4 bg-sky-500 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50 rounded-2xl border border-sky-400/20"
                                >
                                    {loading ? 'Processing...' : 'Update Identity Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                                <Shield size={18} className="text-sky-500" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Security Protocol Update</h2>
                            </div>
                            <form onSubmit={handlePasswordUpdate} className="p-10 space-y-10">
                                <div className="space-y-8">
                                    <SettingsInput
                                        label="Current Access Key"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={v => setPasswordData({ ...passwordData, currentPassword: v })}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <SettingsInput
                                            label="New Authorization Key"
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={v => setPasswordData({ ...passwordData, newPassword: v })}
                                        />
                                        <SettingsInput
                                            label="Verify New Key"
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={v => setPasswordData({ ...passwordData, confirmPassword: v })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-sky-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-800 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />} Reveal Metrics
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-10 py-4 bg-sky-500 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50 rounded-2xl border border-sky-400/20"
                                    >
                                        {loading ? <Smartphone className="animate-spin" size={14} /> : <Save size={14} />} Update Security Matrix
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Alerts' && (
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                                <Bell size={18} className="text-sky-500" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Preferences</h2>
                            </div>
                            <div className="p-8 space-y-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Choose which alerts you want to receive</p>

                                <div className="space-y-4">
                                    <TogglePreference
                                        icon={<Activity size={16} className="text-emerald-500" />}
                                        label="Attendance Alerts"
                                        desc="Get notified when you check in or check out"
                                        checked={notificationPrefs.attendance}
                                        onChange={() => togglePref('attendance')}
                                    />
                                    <TogglePreference
                                        icon={<AlertCircle size={16} className="text-orange-500" />}
                                        label="Leave Updates"
                                        desc="Receive updates on leave approval or rejection"
                                        checked={notificationPrefs.leave}
                                        onChange={() => togglePref('leave')}
                                    />
                                    <TogglePreference
                                        icon={<Bell size={16} className="text-sky-500" />}
                                        label="System Broadcasts"
                                        desc="Stay informed with company-wide announcements"
                                        checked={notificationPrefs.broadcasts}
                                        onChange={() => togglePref('broadcasts')}
                                    />
                                    <TogglePreference
                                        icon={<Mail size={16} className="text-sky-500" />}
                                        label="Daily Reports"
                                        desc="Receive a daily summary of your activity"
                                        checked={notificationPrefs.reports}
                                        onChange={() => togglePref('reports')}
                                    />
                                    <TogglePreference
                                        icon={<MapPin size={16} className="text-blue-500" />}
                                        label="Field Ops Alerts"
                                        desc="Notifications for field tracking sessions"
                                        checked={notificationPrefs.fieldOps}
                                        onChange={() => togglePref('fieldOps')}
                                    />
                                    <TogglePreference
                                        icon={<Shield size={16} className="text-red-500" />}
                                        label="Security Alerts"
                                        desc="Be notified of login activity and access changes"
                                        checked={notificationPrefs.security}
                                        onChange={() => togglePref('security')}
                                    />
                                </div>

                                <div className="pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest max-w-xs text-center sm:text-left">
                                        Preferences are saved locally. Contact admin to enable email delivery.
                                    </p>
                                    <button
                                        onClick={handleSaveAlerts}
                                        className="px-10 py-4 bg-sky-500 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-sky-600/20 active:scale-95 transition-all whitespace-nowrap rounded-2xl border border-sky-400/20"
                                    >
                                        <Save size={14} />
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Portal Config' && user?.email === 'admin@cctv.com' && (
                        <div className="bg-white/50 backdrop-blur-xl border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-sky-100 bg-sky-50 flex items-center gap-3">
                                <Globe size={18} className="text-sky-500" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Portal External Integration</h2>
                            </div>
                            <div className="p-10 space-y-10">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update links for external platforms and customer reviews.</p>

                                <div className="space-y-8">
                                    <SettingsInput
                                        label="Cx Online Booking Platform URL"
                                        value={portalConfig.cxUrl}
                                        onChange={v => setPortalConfig({ ...portalConfig, cxUrl: v })}
                                        placeholder="https://your-cx-portal.com"
                                        icon={<Globe size={14} />}
                                    />
                                    <SettingsInput
                                        label="Google Review Base URL"
                                        value={portalConfig.reviewUrl}
                                        onChange={v => setPortalConfig({ ...portalConfig, reviewUrl: v })}
                                        placeholder="https://g.page/r/identifer"
                                        icon={<LinkIcon size={14} />}
                                    />
                                </div>

                                <div className="pt-6 border-t border-sky-100 flex flex-col gap-6">
                                    <div className="p-6 bg-sky-500/5 rounded-[1.5rem] border border-sky-500/10 flex items-start gap-3">
                                        <AlertCircle size={16} className="text-sky-500 mt-0.5" />
                                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-tight leading-relaxed">
                                            Changes here affect the "Cx Platform" button in the Command Center and the "Share Review Link" button for field partners.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSavePortalConfig}
                                        className="px-10 py-5 bg-sky-500 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-sky-600/20 active:scale-95 transition-all self-end rounded-2xl border border-sky-400/20"
                                    >
                                        <Save size={16} /> Update Integration Protocols
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-white text-slate-400 rounded-[1.5rem] border border-sky-100 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 justify-center shadow-inner">
                <Server size={14} /> Secure Encryption: AES-256 Validated Node
            </div>
        </div>
    );
};

const SettingsInput = ({ label, value, onChange, placeholder, type = "text", readOnly }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <input
                readOnly={readOnly}
                required={!readOnly}
                type={type}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sm font-black text-slate-800 focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-800 outline-none shadow-inner uppercase tracking-tight ${readOnly ? 'bg-white/50 cursor-not-allowed text-slate-500' : ''}`}
            />
            {readOnly && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800"><Lock size={12} /></div>}
        </div>
    </div>
);

const TogglePreference = ({ icon, label, desc, checked, onChange }) => (
    <div
        onClick={onChange}
        className="flex items-center justify-between gap-6 p-6 bg-sky-50 border border-sky-100 rounded-[2rem] hover:border-sky-500/30 hover:bg-white transition-all cursor-pointer group shadow-inner"
    >
        <div className="flex items-center gap-5">
            <div className="p-3.5 bg-white rounded-2xl border border-sky-100 shadow-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{label}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{desc}</p>
            </div>
        </div>
        <div className={`relative w-12 h-6 rounded-full transition-colors duration-500 flex-shrink-0 ${checked ? 'bg-sky-500' : 'bg-white'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
    </div>
);

export default SettingsPage;


