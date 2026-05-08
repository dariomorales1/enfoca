import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    // const { isAuthenticated, loading } = useAuth();
    //
    // if (loading) {
    //     return (
    //         <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center">
    //             <div className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
    //         </div>
    //     );
    // }
    //
    // if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}
