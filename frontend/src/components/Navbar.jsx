import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <LayoutDashboard className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">TrackWise</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserCircle className="h-6 w-6" />
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md text-gray-500 hover:bg-gray-50 hover:text-red-600 focus:outline-none transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
