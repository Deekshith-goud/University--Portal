import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Pin, Calendar, Tag, ChevronDown, CheckCircle, 
    AlertCircle, FileText, Image as ImageIcon, X, Megaphone,
    Download, ExternalLink, Plus, Trash2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Create Mode
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'Notice',
        is_pinned: false,
        target_departments: [], // Array of strings or empty for All
        attachments: [], // {name, url}
        images: [] // urls
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [filterDept, filterCategory]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterDept) params.department = filterDept;
            if (filterCategory) params.category = filterCategory;
            
            const res = await api.get('/college/announcements', { params });
            setAnnouncements(res.data);
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/college/announcements', newPost);
            setShowCreateModal(false);
            fetchAnnouncements();
            // Reset form
            setNewPost({ title: '', content: '', category: 'Notice', is_pinned: false, target_departments: [], attachments: [], images: [] });
        } catch (err) {
            alert("Failed to post announcement");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await api.delete(`/college/announcements/${id}`);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to delete announcement");
        }
    };

    const toggleDept = (dept) => {
        setNewPost(prev => {
            const current = prev.target_departments;
            if (current.includes(dept)) {
                return { ...prev, target_departments: current.filter(d => d !== dept) };
            } else {
                return { ...prev, target_departments: [...current, dept] };
            }
        });
    };
    
    // Helper to add attachment input
    const addAttachment = () => {
        const name = prompt("Attachment Name (e.g. Schedule PDF)");
        const url = prompt("Attachment URL");
        if (name && url) {
            setNewPost(prev => ({
                ...prev,
                attachments: [...prev.attachments, { name, url }]
            }));
        }
    };

    // Filtered list client-side for search
    const filteredAnnouncements = announcements.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const departments = ['CSE', 'ECE', 'AIML', 'DS', 'CS', 'BT', 'MECH', 'CIVIL'];
    const categories = ['Notice', 'Circular', 'Exam', 'Event Info', 'Update'];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        {/* Header & Title */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Megaphone className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">Announcements</h1>
                                <p className="text-slate-500 text-xs font-medium">Official Updates & Circulars</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            {/* Search */}
                            <div className="relative max-w-md w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all"
                                    placeholder="Search announcements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filters Dropdown (Simple for now) */}
                            <select 
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-rose-300"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                             <select 
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hidden md:block focus:outline-none focus:border-rose-300"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                <option value="">All Depts</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            {/* Create Button */}
                            {(user?.role === 'admin' || user?.role === 'faculty') && (
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Post New</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading announcements...</div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-300" />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900">No announcements found</h3>
                         <p className="text-slate-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredAnnouncements.map((ann) => (
                            <motion.div 
                                key={ann.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-2xl p-6 shadow-sm border ${ann.is_pinned ? 'border-rose-200 ring-4 ring-rose-50/50' : 'border-slate-100 hover:border-slate-300'} transition-all group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${ann.category === 'Circular' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                                                {ann.title}
                                                {ann.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wide">
                                                        <Pin className="w-3 h-3 fill-current" /> Pinned
                                                    </span>
                                                )}
                                                {/* New Tag logic */}
                                                {new Date(ann.published_at) > new Date(Date.now() - 48 * 60 * 60 * 1000) && (
                                                     <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                                                        New
                                                     </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mt-1">
                                                <span className="uppercase tracking-wider font-bold text-slate-500">{ann.category}</span>
                                                <span>•</span>
                                                <span>{new Date(ann.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                                                {ann.target_departments && ann.target_departments.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            {ann.target_departments.join(', ')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(user?.role === 'admin' || user?.role === 'faculty') && (
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            className="p-2 text-slate-300 bg-transparent hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="prose prose-sm text-slate-600 max-w-none mb-6 pl-[52px]">
                                    <p className="whitespace-pre-line">{ann.content}</p>
                                </div>
                                
                                <div className="pl-[52px]">
                                    {ann.images && ann.images.length > 0 && (
                                        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {ann.images.map((img, i) => (
                                                <img key={i} src={img} alt="Attachment" className="rounded-lg border border-slate-100 w-full h-32 object-cover bg-slate-50" />
                                            ))}
                                        </div>
                                    )}

                                    {ann.attachments && ann.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {ann.attachments.map((att, i) => (
                                                <a 
                                                    key={i} 
                                                    href={att.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm transition-all"
                                                >
                                                    {att.name.toLowerCase().endsWith('.pdf') ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                                    {att.name}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                        >
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Post Announcement</h2>
                                    <p className="text-slate-500 text-xs mt-1">Share news with students and faculty.</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreate} className="p-6 space-y-6">
                                {/* Type & Pin */}
                                <div className="flex gap-4">
                                     <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <select 
                                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-0 rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-rose-500 appearance-none"
                                                value={newPost.category}
                                                onChange={e => setNewPost({...newPost, category: e.target.value})}
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Visibility</label>
                                        <button 
                                            type="button"
                                            onClick={() => setNewPost(p => ({ ...p, is_pinned: !p.is_pinned }))}
                                            className={`h-[42px] px-4 rounded-xl border font-bold flex items-center gap-2 transition-all ${newPost.is_pinned ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <Pin className={`w-4 h-4 ${newPost.is_pinned ? 'fill-current' : ''}`} /> 
                                            {newPost.is_pinned ? 'Pinned' : 'Pin Post'}
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <div>
                                        <input 
                                            className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-bold text-xl placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-200"
                                            placeholder="Announcement Headline"
                                            value={newPost.title}
                                            onChange={e => setNewPost({...newPost, title: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-medium text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-200 min-h-[200px] resize-none leading-relaxed"
                                            placeholder="Type your announcement details here..."
                                            value={newPost.content}
                                            onChange={e => setNewPost({...newPost, content: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
                                    {/* Audience */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Audience (Optional)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {departments.map(dept => (
                                                <button 
                                                    key={dept}
                                                    type="button"
                                                    onClick={() => toggleDept(dept)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newPost.target_departments.includes(dept) ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                                                >
                                                    {dept}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Attachments & Links */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Resources (Links & Files)</label>
                                        
                                        {/* Attachment List */}
                                        <div className="space-y-2 mb-3">
                                            {newPost.attachments.map((att, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-100 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-xs uppercase">
                                                             {att.name.split('.').pop().slice(0,3)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-slate-700 truncate">{att.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{att.url}</div>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => setNewPost(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New Logic */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {/* File Upload */}
                                            <div className="relative flex-1">
                                                <input 
                                                    type="file" 
                                                    id="file-upload" 
                                                    className="hidden" 
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        
                                                        try {
                                                            // Show loading state if desired, for now just await
                                                            const res = await api.post('/upload/file', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setNewPost(prev => ({
                                                                ...prev,
                                                                attachments: [...prev.attachments, { name: file.name, url: `http://localhost:8000${res.data.url}` }]
                                                            }));
                                                        } catch (err) {
                                                            alert("Upload failed");
                                                            console.error(err);
                                                        }
                                                        e.target.value = null; // reset
                                                    }}
                                                />
                                                <label 
                                                    htmlFor="file-upload"
                                                    className="flex items-center justify-center gap-2 w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm cursor-pointer hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all"
                                                >
                                                    <Download className="w-4 h-4" /> Browse Files
                                                </label>
                                            </div>

                                            {/* Link Input */}
                                            <div className="flex-1 flex gap-2">
                                                <input 
                                                    className="flex-1 p-4 bg-slate-50 border-0 rounded-2xl font-medium text-sm text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                                    placeholder="Paste URL here..."
                                                    id="link-input"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById('link-input');
                                                        if (input.value) {
                                                            setNewPost(prev => ({
                                                                ...prev,
                                                                attachments: [...prev.attachments, { name: 'External Link', url: input.value }]
                                                            }));
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="px-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center gap-2">
                                        <Megaphone className="w-4 h-4" /> Publish Now
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;
