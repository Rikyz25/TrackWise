import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // Or custom unauthorized page
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
};

export default function App() {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            {/* Root routing logic based on role */}
            <Route path="/" element={
                 !user ? <Navigate to="/login" /> 
                 : user.role === 'manager' ? <Navigate to="/manager" /> 
                 : <Navigate to="/employee" /> 
            } />

            <Route path="/employee" element={
                <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                </ProtectedRoute>
            } />

            <Route path="/manager" element={
                <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}
