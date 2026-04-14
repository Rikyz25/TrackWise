import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrendingUp, Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('admin@trackwise.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

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
                        Sign in to manage your expenses
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100">
                        <p className="font-semibold mb-1">Test Accounts:</p>
                        <p>Manager: admin@trackwise.com | password</p>
                        <p>Employee: employee@trackwise.com | password</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="text-center mt-4 text-sm">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Sign up here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
