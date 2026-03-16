import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, setIsLoginModalOpen } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Verifying Authorization...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        setIsLoginModalOpen(true);
        // We handle the redirect via redirectUrl if needed, 
        // but often the modal closure handles it.
        // For protected routes, we might still want to show a "Login Required" message.
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-4">Authentication Required</h2>
                    <p className="text-sm text-slate-500 mb-6 font-bold uppercase tracking-widest text-[10px]">Please log in via the security popup to access this node.</p>
                    <button 
                        onClick={() => setIsLoginModalOpen(true)}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 transition-all shadow-lg"
                    >
                        Reveal Login Popup
                    </button>
                </div>
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their default dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
