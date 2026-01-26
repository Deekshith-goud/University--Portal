import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, FileText, Download, X, Eye, CheckCircle, AlertCircle, FileUp, Trash2, Filter } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';

const Resources = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [formData, setFormData] = useState({ branch: '', subject: '', tag: '', section: 'A', file: null });
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    // Get subject from URL query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const subjectParam = params.get('subject');
        if (subjectParam) {
            setSearch(subjectParam);
        }
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            setToast({ message: "Please select a file!", type: "error" });
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('title', `${formData.subject} - ${formData.tag}`);
        data.append('subject', formData.subject);
        data.append('branch', formData.branch);
        data.append('tag', formData.tag);
        data.append('section', formData.section);
        data.append('file', formData.file);

        try {
            await api.post('/notes/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setToast({ message: "Notes Uploaded Successfully!", type: "success" });
            setFormData({ branch: '', subject: '', tag: '', section: 'A', file: null });
            setShowUpload(false);
            fetchNotes(); 
        } catch (err) {
            console.error(err);
            setToast({ message: "Upload Failed. Try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await api.delete(`/notes/${id}`);
            setToast({ message: "Resource Deleted", type: "success" });
            fetchNotes();
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to delete", type: 'error' });
        }
    };

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const filteredNotes = notes.filter(note => {
        const matchesSearch = 
            note.title.toLowerCase().includes(search.toLowerCase()) ||
            note.subject.toLowerCase().includes(search.toLowerCase()) ||
            (note.tag && note.tag.toLowerCase().includes(search.toLowerCase()));
        
        const matchesBranch = filterBranch ? note.branch === filterBranch : true;

        return matchesSearch && matchesBranch;
    });

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL}${url}`;
    };

    return (
        <div className="p-8 min-h-screen relative overflow-hidden">
             {/* Animated Background */}
             <div className="fixed inset-0 -z-10 bg-slate-50">
                <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 relative z-10">
                <div>
                     <h1 className="text-4xl font-black text-slate-900 mb-2 font-display flex items-center gap-3">
                        <FileText className="w-10 h-10 text-blue-600" />
                        Resource Service
                    </h1>
                    <p className="text-slate-500 font-medium">Shared knowledge base for all branches.</p>
                </div>
                <button 
                    onClick={() => setShowUpload(true)}
                    className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    Share Notes
                </button>
            </div>

            {/* Controls: Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-10 relative z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search topics, subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="AIML">AIML</option>
                        <option value="DS">DS</option>
                    </select>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pb-20">
                {filteredNotes.length === 0 && !loading ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">No resources found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <motion.div 
                            key={note.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="group bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100">
                                    {note.branch}
                                </span>
                                {(user.id === note.uploaded_by_id || user.role === 'admin') && (
                                    <button 
                                        onClick={() => handleDelete(note.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{note.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {note.subject}
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {note.tag}
                            </p>

                            <div className="mt-auto pt-4 border-t border-slate-100/50">
                                {note.uploaded_by && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                                            {note.uploaded_by.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Shared By</p>
                                            <p className="text-sm font-bold text-slate-700 leading-none">{note.uploaded_by.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <a 
                                        href={getFileUrl(note.file_url)} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                    >
                                        <Eye className="w-4 h-4" /> Preview
                                    </a>
                                    <a 
                                        href={getFileUrl(note.file_url)} 
                                        download
                                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Save
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900">Upload Notes</h3>
                                <button onClick={() => setShowUpload(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Branch</label>
                                        <input 
                                            type="text" placeholder="e.g. CSE" required
                                            className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                            value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Subject</label>
                                        <input 
                                            type="text" placeholder="e.g. OS" required
                                            className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                            value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Tag / Unit</label>
                                        <input 
                                            type="text" placeholder="e.g. Unit 1" required
                                            className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                            value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}
                                        />
                                     </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Section</label>
                                        <select 
                                            className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                            value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                        </select>
                                     </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Document</label>
                                    <div 
                                        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden" 
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                {formData.file ? <CheckCircle className="w-6 h-6" /> : <FileUp className="w-6 h-6" />}
                                            </div>
                                            <p className="font-bold text-slate-700 text-sm truncate max-w-xs">
                                                {formData.file ? formData.file.name : "Click to select file"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Uploading...' : 'Share Resource'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-8 right-8 z-[120] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    >
                        {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Resources;
