import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import api from '../services/api';
import { Plus, Upload, CheckCircle, FileUp, X, Users, Download, FileText, Calendar, Clock, Paperclip, AlertCircle, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    
    // Create Form State
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [deadline, setDeadline] = useState('');
    const [targetBranch, setTargetBranch] = useState('');
    const [targetSection, setTargetSection] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Student Submission State
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [mySubmissions, setMySubmissions] = useState(new Set()); // IDs of submitted assignments
    
    // Student Extra Fields
    const [regNo, setRegNo] = useState('');
    const [branch, setBranch] = useState('CSE');
    const [section, setSection] = useState('A');
    
    const fileInputRef = useRef(null);

    // Faculty View Submissions State
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubs, setLoadingSubs] = useState(false);

    useEffect(() => {
        fetchAssignments();
        if (user.role === 'student') {
            fetchMySubmissions();
        }
    }, [user.role]);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMySubmissions = async () => {
        try {
            const res = await api.get('/assignments/me/submissions');
            // Store submitted assignment IDs in a Set for O(1) lookup
            const submittedIds = new Set(res.data.map(sub => sub.assignment_id));
            setMySubmissions(submittedIds);
        } catch (err) {
            console.error("Failed to fetch status", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', desc);
            formData.append('deadline', new Date(deadline).toISOString());
            if (targetBranch) formData.append('branch', targetBranch);
            if (targetSection) formData.append('section', targetSection);
            if (attachment) formData.append('file', attachment);

            await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowCreate(false);
            fetchAssignments();
            // Reset Form
            setTitle(''); setDesc(''); setDeadline(''); setTargetBranch(''); setTargetSection(''); setAttachment(null);
        } catch (err) {
            alert('Failed to create assignment');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await api.delete(`/assignments/${id}`);
            alert("Assignment deleted");
            fetchAssignments();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Failed to delete");
        }
    };

    // --- STUDENT LOGIC ---
    const initiateSubmission = (assignment) => {
        setSelectedAssignment(assignment);
        setSelectedFile(null);
        // Reset form defaults if cleaner UX needed
        setRegNo('');
        setBranch('CSE');
        setSection('A');
        
        setShowSubmitModal(true);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const submitFile = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedAssignment || !regNo) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('reg_no', regNo);
        formData.append('branch', branch);
        formData.append('section', section);

        try {
            await api.post(`/assignments/${selectedAssignment.id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Submitted successfully!');
            setShowSubmitModal(false);
            setSelectedFile(null);
            fetchMySubmissions(); // Update status
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Submission failed.');
        } finally {
            setUploading(false);
        }
    };

    // --- FACULTY LOGIC ---
    const viewSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmissionsModal(true);
        setLoadingSubs(true);
        setSubmissions([]); // Clear previous data first
        try {
            const res = await api.get(`/assignments/${assignment.id}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load submissions");
        } finally {
            setLoadingSubs(false);
        }
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL}${url}`;
    };

    const formatDate = (dateString) => {
        // Force UTC interpretation by appending Z if missing (server sends naive UTC)
        const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    }

    const isPastDeadline = (deadlineString) => {
        const deadline = new Date(deadlineString.endsWith('Z') ? deadlineString : deadlineString + 'Z');
        return new Date() > deadline;
    }

    return (
        <div className="p-8 min-h-screen relative overflow-hidden">
             {/* Animated Background */}
             <div className="fixed inset-0 -z-10 bg-slate-50">
                <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 relative z-10">
                <div>
                     <h1 className="text-4xl font-black text-slate-900 mb-2 font-display flex items-center gap-3">
                        <FileText className="w-10 h-10 text-indigo-600" />
                        Assignments
                    </h1>
                    <p className="text-slate-500 font-medium">Manage tasks and track progress.</p>
                </div>
                {user.role === 'faculty' && (
                    <button 
                        onClick={() => setShowCreate(true)}
                        className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Assignment
                    </button>
                )}
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 pb-20">
                {assignments.map(a => {
                    const isSubmitted = mySubmissions.has(a.id);
                    const isLate = isPastDeadline(a.deadline);

                    return (
                        <motion.div 
                            key={a.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            className="group bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Decorative Gradient Bar */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                    {a.branch || 'All Branches'}
                                </span>
                                
                                <div className="flex gap-2">
                                     {/* Student Status Badge */}
                                    {user.role === 'student' && (
                                        <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${
                                            isSubmitted 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : isLate 
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {isSubmitted ? 'Submitted' : isLate ? 'Missing' : 'Pending'}
                                        </div>
                                    )}

                                    <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                                        {formatDate(a.deadline)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{a.title}</h3>
                                {user.role === 'faculty' && user.id === a.faculty_id && (
                                    <button 
                                        onClick={() => handleDelete(a.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete Assignment"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            
                            <p className="text-slate-500 mb-6 leading-relaxed font-medium">{a.description}</p>

                            {/* Attachments & Meta */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                {a.attachment_url && (
                                    <a 
                                        href={getFileUrl(a.attachment_url)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        Attachment
                                    </a>
                                )}
                            </div>

                            {/* Footer: Assigned By -> Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {a.faculty ? a.faculty.name.charAt(0) : 'F'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assigned By</p>
                                        <p className="text-sm font-bold text-slate-700">{a.faculty ? a.faculty.name : 'Faculty'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {user.role === 'faculty' && (
                                        <button 
                                            onClick={() => viewSubmissions(a)}
                                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" /> Submissions
                                        </button>
                                    )}
                                    {user.role === 'student' && (
                                        <button 
                                            onClick={() => initiateSubmission(a)}
                                            disabled={isSubmitted || isLate}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                                                isSubmitted 
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/30 cursor-default'
                                                : isLate
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {isSubmitted ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                            {isSubmitted ? 'Completed' : isLate ? 'Deadline Missed' : 'Submit Work'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Create Assignment Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                             <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                            
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Create Assignment</h2>
                            <p className="text-slate-500 mb-8">Assign tasks to specific branches or sections.</p>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-4">
                                    <input className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 text-lg placeholder-slate-400" placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} required />
                                    <textarea className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 h-32 placeholder-slate-400 resize-none" placeholder="Description & Instructions..." value={desc} onChange={e => setDesc(e.target.value)} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Deadline</label>
                                        <input className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                                    </div>
                                    <div>
                                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Attachment (Optional)</label>
                                         <input 
                                            type="file" 
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            onChange={(e) => setAttachment(e.target.files[0])}
                                          />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" value={targetBranch} onChange={e => setTargetBranch(e.target.value)}>
                                        <option value="">All Branches</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="AIML">AIML</option>
                                    </select>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" value={targetSection} onChange={e => setTargetSection(e.target.value)}>
                                        <option value="">All Sections</option>
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                        <option value="C">Section C</option>
                                    </select>
                                </div>

                                <button type="submit" disabled={isCreating} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all">
                                    {isCreating ? 'Publishing...' : 'Publish Assignment'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student Submission Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                     >
                         <motion.div 
                             initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                             className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                         >
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                 <div>
                                     <h3 className="text-xl font-black text-slate-900">Submit Assignment</h3>
                                     <p className="text-sm text-slate-500 font-medium">{selectedAssignment?.title}</p>
                                 </div>
                                 <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                                     <X className="w-5 h-5" />
                                 </button>
                             </div>
                             
                             <form onSubmit={submitFile} className="p-6 space-y-5">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Registration Number</label>
                                     <input 
                                         type="text" required placeholder="e.g. 242FA01001" 
                                         className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 placeholder-slate-300"
                                         value={regNo} onChange={e => setRegNo(e.target.value)}
                                     />
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Branch</label>
                                         <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" value={branch} onChange={e => setBranch(e.target.value)}>
                                             <option value="CSE">CSE</option>
                                             <option value="AIML">AIML</option>
                                             <option value="DS">DS</option>
                                             <option value="ECE">ECE</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Section</label>
                                         <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" value={section} onChange={e => setSection(e.target.value)}>
                                             <option value="A">A</option>
                                             <option value="B">B</option>
                                             <option value="C">C</option>
                                             <option value="D">D</option>
                                         </select>
                                     </div>
                                 </div>
 
                                 <div 
                                     className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group"
                                     onClick={() => fileInputRef.current.click()}
                                 >
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                     <div className="flex flex-col items-center gap-2">
                                         <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                             {selectedFile ? <CheckCircle className="w-6 h-6" /> : <FileUp className="w-6 h-6" />}
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-700 text-sm">{selectedFile ? selectedFile.name : "Upload your work"}</p>
                                             <p className="text-xs text-slate-400">PDF, DOCX up to 10MB</p>
                                         </div>
                                     </div>
                                 </div>
 
                                 <button 
                                     type="submit" disabled={!selectedFile || uploading}
                                     className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                 >
                                     {uploading ? 'Uploading Submission...' : 'Confirm Submission'}
                                 </button>
                             </form>
                         </motion.div>
                     </motion.div>
                )}
            </AnimatePresence>

            {/* View Submissions Modal */}
            <AnimatePresence>
                {showSubmissionsModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                         <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Task Submissions</h3>
                                    <p className="text-sm text-slate-500">{selectedAssignment?.title}</p>
                                </div>
                                <button onClick={() => setShowSubmissionsModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="p-0 overflow-y-auto flex-1">
                                {loadingSubs ? (
                                    <div className="p-12 text-center text-slate-400">Loading records...</div>
                                ) : submissions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 opacity-50" /></div>
                                        <p>No submissions received yet.</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Branch & Sec</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {submissions.map((sub, idx) => (
                                                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900 bg-indigo-50/30">{sub.registration_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{sub.student_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        <span className="px-2 py-1 rounded bg-slate-100 text-xs font-bold mr-2">{sub.branch}</span>
                                                        <span className="text-xs font-bold text-slate-400">{sub.section}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                                        <a 
                                                            href={getFileUrl(sub.file_url)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a 
                                                            href={getFileUrl(sub.file_url)} 
                                                            download
                                                            className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Assignments;
