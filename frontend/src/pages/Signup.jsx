import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Lock, Mail, User } from 'lucide-react';
import api from '../services/api';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }
        try {
            await api.post('/signup.php', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600">You can now login as an employee. Redirecting you to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                
                <div>
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        TrackWise
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Create your employee account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text" required
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                                    placeholder="Enter your name"
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email" required
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                                    placeholder="Enter your email"
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password" required minLength="6"
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                                    placeholder="Create password"
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 6 characters and should ideally include numbers and letters.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password" required minLength="6"
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all shadow-md"
                    >
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
