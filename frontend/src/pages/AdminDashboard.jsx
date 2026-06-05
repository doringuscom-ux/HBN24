import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, LayoutDashboard, Settings, LogOut, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';

export default function AdminDashboard() {
    const editor = useRef(null);
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('all'); // 'all', 'epaper', 'rashifal'
    const [editingId, setEditingId] = useState(null);
    const [rashifalData, setRashifalData] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        image: '',
        imageAlt: '',
        category: 'entertainment',
        content: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        robots: 'index, follow',
        canonicalUrl: '',
        isEpaper: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const API_URL = __API_URL__ + '/api/news';

    useEffect(() => {
        fetchNews();
        fetchRashifal();
    }, []);

    const fetchRashifal = async () => {
        try {
            const res = await fetch(__API_URL__ + '/api/rashifal');
            const data = await res.json();
            if (data.signs) {
                setRashifalData(data.signs);
            }
        } catch (error) {
            console.error('Error fetching rashifal:', error);
        }
    };

    const handleRashifalTextChange = (id, newDesc) => {
        setRashifalData(prev => prev.map(item => item.id === id ? { ...item, desc: newDesc } : item));
    };

    const handleRashifalSave = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(__API_URL__ + '/api/rashifal', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ signs: rashifalData })
            });
            if (res.status === 401) {
                navigate('/admin/login');
                return;
            }
            alert('Rashifal saved successfully!');
        } catch (error) {
            console.error('Error saving rashifal:', error);
            alert('Error saving rashifal');
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            // Sort by newest first assuming _id contains timestamp
            const sortedData = data.sort((a, b) => (a._id < b._id ? 1 : -1));
            setNews(sortedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const updated = { ...prev, [name]: finalValue };
            // Auto-generate slug from title if slug is empty and user is typing title
            if (name === 'title' && !prev.slug) {
                updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return updated;
        });
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        try {
            if (editingId) {
                // Update
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                if (res.status === 401) {
                    navigate('/admin/login');
                    return;
                }
            } else {
                // Create
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                if (res.status === 401) {
                    navigate('/admin/login');
                    return;
                }
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', slug: '', image: '', imageAlt: '', category: 'entertainment', content: '', metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow', canonicalUrl: '', isEpaper: false });
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title || '',
            slug: item.slug || '',
            image: item.image || '',
            imageAlt: item.imageAlt || '',
            category: item.category || 'entertainment',
            content: item.content || '',
            metaTitle: item.metaTitle || '',
            metaDescription: item.metaDescription || '',
            metaKeywords: item.metaKeywords || '',
            robots: item.robots || 'index, follow',
            canonicalUrl: item.canonicalUrl || '',
            isEpaper: item.isEpaper || false
        });
        setEditingId(item._id);
        setIsModalOpen(true);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            const token = localStorage.getItem('adminToken');
            try {
                const res = await fetch(`${API_URL}/${id}`, { 
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 401) {
                    navigate('/admin/login');
                    return;
                }
                fetchNews();
            } catch (error) {
                console.error('Error deleting news:', error);
            }
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ title: '', slug: '', image: '', imageAlt: '', category: 'entertainment', content: '', metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow', canonicalUrl: '', isEpaper: false });
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const token = localStorage.getItem('adminToken');
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const res = await fetch(__API_URL__ + '/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            if (res.status === 401) {
                navigate('/admin/login');
                return;
            }

            const data = await res.json();
            if (res.ok) {
                // Set the returned Cloudinary URL
                setFormData(prev => ({ ...prev, image: data.imageUrl }));
            } else {
                alert(data.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    // Derived State
    const filteredNews = news.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesView = currentView === 'all' || (currentView === 'epaper' && item.isEpaper);
        return matchesSearch && matchesCategory && matchesView;
    });

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategory]);

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'entertainment', label: 'मनोरंजन' },
        { id: 'sports', label: 'खेल' },
        { id: 'religion', label: 'धर्म' },
        { id: 'lifestyle', label: 'लाइफस्टाइल' },
        { id: 'technology', label: 'टेक्नोलॉजी' },
        { id: 'business', label: 'बिज़नेस' },
        { id: 'national', label: 'राष्ट्रीय' },
        { id: 'international', label: 'अंतर्राष्ट्रीय' },
        { id: 'politics', label: 'राजनीति' }
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6 text-2xl font-black border-b border-gray-800 flex items-center gap-2 tracking-tight">
                    <span className="text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">HBN</span> Admin
                </div>
                <div className="flex-1 py-6 flex flex-col gap-2">
                    <button 
                        onClick={() => setCurrentView('all')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'all' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <LayoutDashboard size={20} className={currentView === 'all' ? 'text-red-500' : ''} /> All News
                    </button>
                    <button 
                        onClick={() => setCurrentView('epaper')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'epaper' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <FileText size={20} className={currentView === 'epaper' ? 'text-red-500' : ''} /> E-Paper News
                    </button>
                    <button 
                        onClick={() => setCurrentView('rashifal')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'rashifal' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <Settings size={20} className={currentView === 'rashifal' ? 'text-red-500' : ''} /> Rashifal
                    </button>
                    <a href="/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <LayoutDashboard size={20} /> View Website
                    </a>
                </div>
                <div className="p-6 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full group">
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-10 border-b border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {currentView === 'epaper' ? 'E-Paper Management' : currentView === 'rashifal' ? 'Rashifal Management' : 'News Management'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {currentView === 'epaper' ? 'Manage articles active on the E-Paper page' : currentView === 'rashifal' ? 'Manage daily horoscope for all 12 signs' : 'Manage and publish news articles'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm w-64 transition-all"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md shadow-red-600/20 whitespace-nowrap"
                        >
                            <Plus size={18} /> Add News
                        </button>
                    </div>
                </header>

                {/* Content area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    {currentView === 'rashifal' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800">Update Daily Rashifal</h2>
                                <button onClick={handleRashifalSave} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md">
                                    Save Rashifal
                                </button>
                            </div>
                            {rashifalData.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Loading Rashifal...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rashifalData.map((sign) => (
                                        <div key={sign.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                                            <div className="flex justify-between items-center font-bold text-gray-800 border-b border-gray-200 pb-2">
                                                <span className="text-red-700">{sign.hindi}</span>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">{sign.sign}</span>
                                            </div>
                                            <textarea
                                                className="w-full mt-2 p-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none transition-all resize-none bg-white"
                                                rows="4"
                                                value={sign.desc}
                                                onChange={(e) => handleRashifalTextChange(sign.id, e.target.value)}
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Stats & Filters */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterCategory === cat.id ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{filteredNews.length}</span> news items {filterCategory !== 'all' && `in ${categories.find(c => c.id === filterCategory)?.label}`}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Image</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Category</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {paginatedNews.map((item) => (
                                            <tr key={item._id} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-14 w-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">{item.title}</div>
                                                    {item.isEpaper && (
                                                        <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            Active on E-Paper
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedNews.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FileText size={32} className="text-gray-300" />
                                                        <p className="text-lg font-medium">No news found</p>
                                                        <p className="text-sm">Try adjusting your filters or search query.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredNews.length)}</span> of <span className="font-semibold text-gray-900">{filteredNews.length}</span> entries
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                                // Simple logic to show limited pages
                                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${currentPage === page ? 'bg-red-600 text-white border-transparent' : 'border border-gray-300 text-gray-700 hover:bg-white'}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                    return <span key={page} className="text-gray-400">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    </>
                    )}
                </main>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit News Article' : 'Add New Article'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Column: Main Content */}
                                <div className="flex-1 flex flex-col gap-5">
                                    <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Main Content</h4>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Headline (Title)</label>
                                        <textarea required name="title" value={formData.title} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" rows="2" placeholder="Enter an engaging headline..."></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
                                            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-gray-50" placeholder="Auto-generated if empty" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white">
                                                {categories.filter(c => c.id !== 'all').map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2 mt-1 mb-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                            <input type="checkbox" id="isEpaper" name="isEpaper" checked={formData.isEpaper} onChange={handleInputChange} className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer" />
                                            <label htmlFor="isEpaper" className="text-sm font-semibold text-blue-900 cursor-pointer">Show this article in E-Paper</label>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Article Content</label>
                                        <div className="flex-1 bg-white" style={{ minHeight: '300px', marginBottom: '40px' }}>
                                            <JoditEditor
                                                ref={editor}
                                                value={formData.content}
                                                config={{
                                                    readonly: false,
                                                    height: 300,
                                                    placeholder: 'Paste the full article content here...'
                                                }}
                                                onChange={(newContent) => handleContentChange(newContent)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media & SEO */}
                                <div className="w-full lg:w-[380px] flex flex-col gap-5">
                                    <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Media & SEO</h4>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blog Image</label>
                                        
                                        {/* File Upload Area */}
                                        <div className="mb-3">
                                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-red-400'}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mb-2"></div>
                                                            <p className="text-sm text-gray-500 font-semibold">Uploading...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                            <p className="mb-1 text-sm text-gray-500 font-semibold"><span className="text-red-600">Click to upload</span> image</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                            </label>
                                        </div>

                                        <div className="flex gap-3 items-center">
                                            <input required type="url" name="image" value={formData.image} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="Or enter image URL..." />
                                            {formData.image && (
                                                <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 shadow-sm">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image Alt Text (SEO)</label>
                                        <input type="text" name="imageAlt" value={formData.imageAlt} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="Describe the image..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Title</label>
                                        <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="Leave empty to use Headline" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Description</label>
                                        <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" rows="2" placeholder="Brief summary for search engines..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Keywords</label>
                                        <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="news, politics, sports..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Robots Tag</label>
                                            <select name="robots" value={formData.robots} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white">
                                                <option value="index, follow">index, follow (Default)</option>
                                                <option value="noindex, follow">noindex, follow</option>
                                                <option value="index, nofollow">index, nofollow</option>
                                                <option value="noindex, nofollow">noindex, nofollow</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Canonical URL</label>
                                            <input type="url" name="canonicalUrl" value={formData.canonicalUrl} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-4 pt-5 border-t border-gray-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 rounded-lg shadow-lg shadow-red-600/30 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-transform active:scale-95">{editingId ? 'Save All Changes' : 'Publish Complete Article'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



















