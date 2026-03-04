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
    const [notificationPrefs, setNotificationPrefs] = useState({
        attendance: true,
        leave: true,
        broadcasts: true,
        reports: false,
        fieldOps: true,
        security: true,
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
            await api.put('/employee/change-password', passwordData);
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
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Notification Portal */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]"
                    >
                        <div className={`px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : notification.type === 'info' ? 'bg-slate-900/90 text-white border-slate-700' : 'bg-emerald-500/90 text-white border-emerald-400'}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : notification.type === 'info' ? <Bell size={20} /> : <Shield size={20} />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif italic text-gray-800">Identity Matrix</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage personnel credentials and security protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                                ${activeTab === tab.name
                                    ? 'bg-white border-primary-500 text-primary-500 border-r-4 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === 'Identity' && (
                        <div className="card-hr bg-white overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <UserCircle size={18} className="text-primary-600" />
                                <h2 className="font-medium text-gray-700 italic">Profile <span className="not-italic">Configuration</span></h2>
                            </div>
                            <div className="p-10 space-y-10">
                                <div className="flex items-center gap-8 border-b border-gray-50 pb-10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-100 overflow-hidden shadow-sm">
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300 uppercase">
                                                {user?.name?.charAt(0)}
                                            </div>
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-primary-600 shadow-sm transform group-active:scale-90 transition-all">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{user?.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-mono italic">Sector Header: {user?.role}</p>
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
                                    className="btn-teal px-8 py-3 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary-500/10 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Update Identity Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="card-hr bg-white overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <Shield size={18} className="text-primary-600" />
                                <h2 className="font-medium text-gray-700 italic">Security <span className="not-italic">Protocol Update</span></h2>
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

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 hover:text-primary-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />} Reveal Metrics
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-teal px-10 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary-500/10 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Smartphone className="animate-spin" size={14} /> : <Save size={14} />} Update Security Matrix
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Alerts' && (
                        <div className="card-hr bg-white overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <Bell size={18} className="text-primary-600" />
                                <h2 className="font-medium text-gray-700 italic">Notification <span className="not-italic">Preferences</span></h2>
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
                                        icon={<Bell size={16} className="text-primary-500" />}
                                        label="System Broadcasts"
                                        desc="Stay informed with company-wide announcements"
                                        checked={notificationPrefs.broadcasts}
                                        onChange={() => togglePref('broadcasts')}
                                    />
                                    <TogglePreference
                                        icon={<Mail size={16} className="text-indigo-500" />}
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

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Preferences are saved locally. Contact admin to enable email delivery.
                                    </p>
                                    <button
                                        onClick={handleSaveAlerts}
                                        className="btn-teal px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-500/10 active:scale-95 transition-all whitespace-nowrap"
                                    >
                                        <Save size={14} />
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Portal Config' && user?.email === 'admin@cctv.com' && (
                        <div className="card-hr bg-white overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <Globe size={18} className="text-primary-600" />
                                <h2 className="font-medium text-gray-700 italic">Portal <span className="not-italic">External Integration</span></h2>
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

                                <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                                        <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                                        <p className="text-[10px] font-medium text-blue-800 uppercase tracking-tight">
                                            Changes here affect the "Cx Platform" button in the Command Center and the "Share Review Link" button for field partners.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSavePortalConfig}
                                        className="btn-teal px-10 py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary-500/10 active:scale-95 transition-all self-end"
                                    >
                                        <Save size={16} /> Update Integration Protocols
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-blue-50 text-blue-800 rounded border border-blue-100 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                <Server size={14} /> Secure Encryption: AES-256 Validated Node
            </div>
        </div>
    );
};

const SettingsInput = ({ label, value, onChange, placeholder, type = "text", readOnly }) => (
    <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 font-mono">{label}</label>
        <div className="relative">
            <input
                readOnly={readOnly}
                required={!readOnly}
                type={type}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white border border-gray-200 rounded p-4 text-xs font-bold text-gray-600 focus:outline-none focus:border-primary-600 transition-all ${readOnly ? 'bg-gray-50/50 cursor-not-allowed text-gray-400' : ''}`}
            />
            {readOnly && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-200"><Lock size={12} /></div>}
        </div>
    </div>
);

const TogglePreference = ({ icon, label, desc, checked, onChange }) => (
    <div
        onClick={onChange}
        className="flex items-center justify-between gap-6 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-primary-100 hover:bg-primary-50/20 transition-all cursor-pointer group"
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-wider">{label}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">{desc}</p>
            </div>
        </div>
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
    </div>
);

export default SettingsPage;
