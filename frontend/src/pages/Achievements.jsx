import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Filter, Plus, Search, Medal, Star, Hash, Globe, GraduationCap } from 'lucide-react';
import api from '../services/api';
import AchievementCard from '../components/AchievementCard';
import { useAuth } from '../auth/AuthProvider';
import { CinematicReveal } from '../components/ui/CinematicReveal';

const Achievements = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        title: '',
        description: '',
        category: 'Internal', // Internal, External, Academic, Sports
        badge: 'Gold',
        event_id: '', // Optional for Internal
        external_event_name: '', // For External
        image_url: '',
        certificate_url: ''
    });
    
    // For Internal Events Dropdown
    const [archivedEvents, setArchivedEvents] = useState([]);

    useEffect(() => {
        fetchAchievements();
        fetchEvents(); // For dropdown
    }, [filterCategory]);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const params = filterCategory !== "All" ? { category: filterCategory } : {};
            // If we had a consolidated endpoint:
            const res = await api.get('/achievements/all', { params });
            // Or if existing logic only supports 'my' or 'event', we need 'all' endpoint which we added.
            setAchievements(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
         try {
             // We want archived events mainly? Or all? Usually archived.
             // But actually we might want to assign to any event.
             const res = await api.get('/college/events'); // Assuming this endpoint exists/works
             setArchivedEvents(res.data); 
         } catch(e) {}
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                user_id: parseInt(formData.user_id),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                badge: formData.badge,
                image_url: formData.image_url,
                certificate_url: formData.certificate_url
            };

            if (formData.category === 'Internal' && formData.event_id) {
                payload.event_id = parseInt(formData.event_id);
            } else if (formData.category === 'External') {
                payload.external_event_name = formData.external_event_name;
            } else {
                // Academic / Sports etc might not have event linkage or have custom name
                if(formData.external_event_name) payload.external_event_name = formData.external_event_name;
            }

            await api.post('/achievements/', payload);
            setIsCreateOpen(false);
            setFormData({
                user_id: '', title: '', description: '', category: 'Internal', badge: 'Gold',
                event_id: '', external_event_name: '', image_url: '', certificate_url: ''
            });
            fetchAchievements();
            alert("Achievement Recorded to Hall of Fame! 🏆");
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create");
        }
    };

    const filtered = achievements.filter(ach => 
        ach.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ach.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = [
        { id: "All", icon: <Hash size={14} />, label: "All" },
        { id: "Internal", icon: <Star size={14} />, label: "Internal" },
        { id: "External", icon: <Globe size={14} />, label: "External" },
        { id: "Academic", icon: <GraduationCap size={14} />, label: "Academic" },
    ];

    return (
        <div className="min-h-screen bg-[#0f1014] pb-20 text-white selection:bg-amber-500/30">
            {/* Hero */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                 <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                 
                 <div className="max-w-7xl mx-auto text-center relative z-10">
                     <CinematicReveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                            <Trophy size={12} /> Hall of Fame
                        </div>
                     </CinematicReveal>
                     <CinematicReveal delay={0.1}>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4">
                            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Achievements</span>
                        </h1>
                     </CinematicReveal>
                     <CinematicReveal delay={0.2}>
                         <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                             Celebrating excellence in academics, innovation, and leadership across our campus and beyond.
                         </p>
                     </CinematicReveal>
                 </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                 <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
                     
                     {/* Search */}
                     <div className="relative w-full md:w-96 group">
                         <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                         <input 
                            type="text" 
                            placeholder="Search by student or title..." 
                            className="w-full bg-[#0f1115] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                         />
                     </div>

                     {/* Filters */}
                     <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto custom-scrollbar">
                         {categories.map(cat => (
                             <button 
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                                    filterCategory === cat.id 
                                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                             >
                                 {cat.icon} {cat.label}
                             </button>
                         ))}
                     </div>

                     {/* Create Button (Faculty Only) */}
                     {['admin', 'faculty'].includes(user?.role) && (
                         <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                         >
                             <Plus size={16} /> Add Achievement
                         </button>
                     )}
                 </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                         {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No achievements found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(ach => (
                            <AchievementCard key={ach.id} achievement={ach} />
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            className="bg-[#14151a] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#14151a] z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="text-amber-500" /> New Record
                                </h2>
                                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><Plus className="rotate-45 text-gray-400" /></button>
                            </div>
                            
                            <form onSubmit={handleCreate} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {/* User Selection (Simplified ID for now) */}
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student ID</label>
                                         <input 
                                            type="number" 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                            value={formData.user_id}
                                            onChange={e => setFormData({...formData, user_id: e.target.value})}
                                            required
                                            placeholder="System User ID"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                                         <select 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                         >
                                             <option value="Internal">Internal Event</option>
                                             <option value="External">External Event</option>
                                             <option value="Academic">Academic</option>
                                             <option value="Sports">Sports</option>
                                         </select>
                                     </div>
                                </div>

                                {/* Dynamic Fields based on Category */}
                                {formData.category === 'Internal' ? (
                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Event</label>
                                         <select 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                            value={formData.event_id}
                                            onChange={e => setFormData({...formData, event_id: e.target.value})}
                                            required
                                         >
                                             <option value="">-- Choose Event --</option>
                                             {archivedEvents.map(evt => (
                                                 <option key={evt.id} value={evt.id}>{evt.title}</option>
                                             ))}
                                         </select>
                                    </div>
                                ) : (
                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Event/Competition Name</label>
                                         <input 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                            value={formData.external_event_name}
                                            onChange={e => setFormData({...formData, external_event_name: e.target.value})}
                                            placeholder={formData.category === 'Academic' ? "e.g. End Semester Exams" : "e.g. HackMIT 2025"}
                                         />
                                    </div>
                                )}

                                <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Achievement Title</label>
                                     <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-lg font-bold focus:border-indigo-500 focus:outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        required
                                        placeholder="e.g. 1st Place Winner"
                                     />
                                </div>

                                <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                     <textarea 
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Describe the achievement..."
                                     />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Badge Type</label>
                                         <div className="flex bg-black/30 rounded-xl p-1 border border-white/10">
                                             {['Gold', 'Silver', 'Bronze'].map(b => (
                                                 <button 
                                                    type="button"
                                                    key={b}
                                                    onClick={() => setFormData({...formData, badge: b})}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        formData.badge === b 
                                                        ? b === 'Gold' ? 'bg-yellow-500 text-black' : b === 'Silver' ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white'
                                                        : 'text-gray-500 hover:text-white'
                                                    }`}
                                                 >
                                                     {b}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL (Optional)</label>
                                         <input 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs focus:border-indigo-500 focus:outline-none"
                                            value={formData.image_url}
                                            onChange={e => setFormData({...formData, image_url: e.target.value})}
                                            placeholder="https://..."
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Certificate URL (Optional)</label>
                                         <input 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs focus:border-indigo-500 focus:outline-none"
                                            value={formData.certificate_url}
                                            onChange={e => setFormData({...formData, certificate_url: e.target.value})}
                                            placeholder="https://..."
                                         />
                                     </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-white shadow-lg hover:brightness-110 transition-all mt-4"
                                >
                                    Publish Achievement
                                </button>

                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Achievements;
