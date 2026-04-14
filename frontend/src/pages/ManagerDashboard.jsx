import { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, ListCollapse, CheckCircle, XCircle, Clock, Save, FileText, Search, LayoutList } from 'lucide-react';

export default function ManagerDashboard() {
    const [activeTab, setActiveTab] = useState('pending'); // pending, ledger, categories
    const [pending, setPending] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ledger, setLedger] = useState({ data: [], pagination: {} });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    
    // For editing thresholds inline
    const [editingCatId, setEditingCatId] = useState(null);
    const [editThresholdVal, setEditThresholdVal] = useState('');

    useEffect(() => {
        if (activeTab === 'pending') fetchPending();
        if (activeTab === 'ledger') fetchLedger();
        if (activeTab === 'categories') fetchCategories();
    }, [activeTab, page]);

    useEffect(() => {
        if (activeTab === 'ledger') {
            const delay = setTimeout(() => {
                fetchLedger();
            }, 300);
            return () => clearTimeout(delay);
        }
    }, [search]);

    const fetchPending = async () => {
        try {
            const res = await api.get('/expenses.php?status=pending');
            setPending(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories.php');
            setCategories(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchLedger = async () => {
        try {
            const res = await api.get(`/ledger.php?page=${page}&limit=10&search=${search}`);
            setLedger(res.data);
        } catch (error) { console.error(error); }
    };

    const handleApproval = async (id, status) => {
        try {
            await api.put('/expenses.php', { id, status });
            fetchPending(); // refresh list
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const saveThreshold = async (id) => {
        try {
            await api.put('/categories.php', { id, threshold: parseFloat(editThresholdVal) });
            setEditingCatId(null);
            fetchCategories();
        } catch (error) {
            alert('Failed to save threshold');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('pending')} className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <Clock className={`mr-2 h-5 w-5 ${activeTab === 'pending' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        Pending Approvals
                        {pending.length > 0 && activeTab !== 'pending' && <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">{pending.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('ledger')} className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ledger' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <FileText className={`mr-2 h-5 w-5 ${activeTab === 'ledger' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        Expense Ledger
                    </button>
                    <button onClick={() => setActiveTab('categories')} className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <Settings className={`mr-2 h-5 w-5 ${activeTab === 'categories' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        Categories Rules
                    </button>
                </nav>
            </div>

            {/* TABS CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                
                {/* PENDING TAB */}
                {activeTab === 'pending' && (
                    <div>
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Requires Your Action</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pending.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    No pending expenses to review.
                                </div>
                            ) : (
                                pending.map(exp => (
                                    <div key={exp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="mb-4 sm:mb-0 max-w-xl">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-semibold text-gray-900">{exp.employee_name}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 rounded-md">{exp.category_name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{exp.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(exp.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold font-mono text-gray-900 mr-4">₹{parseFloat(exp.amount).toFixed(2)}</span>
                                            <button onClick={() => handleApproval(exp.id, 'rejected')} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                Reject
                                            </button>
                                            <button onClick={() => handleApproval(exp.id, 'approved')} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* LEDGER TAB */}
                {activeTab === 'ledger' && (
                    <div>
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-gray-900">Approved Ledger</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" placeholder="Search description, employee..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ledger.data.length === 0 ? (
                                        <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-500">No records found.</td></tr>
                                    ) : (
                                        ledger.data.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                                                <td className="px-5 py-4 text-sm">
                                                    <div className="font-medium text-gray-900">{item.employee_name}</div>
                                                    <div className="text-xs text-gray-500 w-32 truncate" title={item.description}>{item.description}</div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-900 text-sm">₹{parseFloat(item.amount).toFixed(2)}</td>
                                                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{item.category_name}</td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'auto_approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                        {item.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {ledger.pagination.total_pages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Page {ledger.pagination.page} of {ledger.pagination.total_pages}
                                </span>
                                <div className="space-x-2">
                                    <button 
                                        disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >Prev</button>
                                    <button 
                                        disabled={page === ledger.pagination.total_pages} onClick={() => setPage(p => p + 1)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === 'categories' && (
                    <div>
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Manage Thresholds</h3>
                            <p className="text-sm text-gray-500 mt-1">Expenses at or below the threshold will be auto-approved.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                            {categories.map(cat => (
                                <div key={cat.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between hover:shadow-sm transition-shadow">
                                    <div>
                                        <div className="font-semibold text-gray-900 mb-1">{cat.name}</div>
                                        {editingCatId === cat.id ? (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm text-gray-500">₹</span>
                                                <input 
                                                    type="number" step="1" 
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                                    value={editThresholdVal} onChange={e => setEditThresholdVal(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block font-mono">
                                                Current: ₹{parseFloat(cat.threshold).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {editingCatId === cat.id ? (
                                            <button onClick={() => saveThreshold(cat.id)} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" title="Save">
                                                <Save className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button onClick={() => { setEditingCatId(cat.id); setEditThresholdVal(cat.threshold); }} className="text-sm text-gray-600 hover:text-blue-600 underline font-medium">
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
