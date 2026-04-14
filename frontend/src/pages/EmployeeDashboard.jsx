import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Upload, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ initial_allowance: 10000, total_approved_spent: 0, remaining_balance: 10000 });
    
    const [formData, setFormData] = useState({
        amount: '',
        category_id: '',
        description: '',
        bill: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, expRes] = await Promise.all([
                api.get('/categories.php'),
                api.get(`/expenses.php?user_id=${user.id}`)
            ]);
            setCategories(catRes.data);
            setExpenses(expRes.data.expenses);
            setSummary(expRes.data.summary);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, bill: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const submitData = new FormData();
        submitData.append('amount', formData.amount);
        submitData.append('category_id', formData.category_id);
        submitData.append('description', formData.description);
        if (formData.bill) {
            submitData.append('bill', formData.bill);
        }

        try {
            const res = await api.post('/expenses.php', submitData);
            setMessage({ type: 'success', text: `Expense submitted successfully! Status: ${res.data.status}` });
            setFormData({ amount: '', category_id: '', description: '', bill: null });
            fetchData(); // Refresh UI
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit expense.' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'approved': return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
            case 'auto_approved': return <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />;
            case 'rejected': return <XCircle className="h-4 w-4 text-red-500 mr-1" />;
            default: return <Clock className="h-4 w-4 text-amber-500 mr-1" />;
        }
    };

    const getStatusStyle = (status) => {
         switch(status) {
            case 'approved': return "bg-green-50 text-green-700 border-green-200";
            case 'auto_approved': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'rejected': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-amber-50 text-amber-700 border-amber-200";
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            
            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Remaining Balance</h2>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold ${summary.remaining_balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            ₹{summary.remaining_balance?.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">out of ₹{summary.initial_allowance}</span>
                    </div>
                    {summary.remaining_balance < 0 && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Allowance exceeded
                        </div>
                    )}
                </div>
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Submit Expense</h3>
                    </div>
                    <div className="p-5">
                        {message.text && (
                            <div className={`p-3 mb-4 rounded-lg text-sm border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input 
                                    type="number" step="0.01" required min="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    required rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bill (Optional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <span className="pl-1">or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{formData.bill ? formData.bill.name : 'PNG, JPG, PDF up to 5MB'}</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" disabled={loading}
                                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 transition-colors"
                            >
                                {loading ? 'Submitting...' : 'Submit Expense'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-2 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Your Expense History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length === 0 ? (
                                    <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-500">No expenses found.</td></tr>
                                ) : (
                                    expenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(exp.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-900 text-sm">{exp.description}</div>
                                                <div className="text-xs text-gray-500 mt-1">{exp.category_name}</div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-900 text-sm">
                                                ₹{parseFloat(exp.amount).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(exp.status)}`}>
                                                    {getStatusIcon(exp.status)}
                                                    {exp.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
