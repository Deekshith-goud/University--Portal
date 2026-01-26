import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, MapPin, Clock, Users, ChevronRight, X, 
    Plus, Upload, Image as ImageIcon, Sparkles, Trophy,
    ArrowRight, CheckCircle, AlertTriangle, Link as LinkIcon, FileText, Download, Trash2, Timer, Eye, Archive
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import { CinematicReveal } from '../components/ui/CinematicReveal';
import AchievementList from '../components/AchievementList';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [activeEvents, setActiveEvents] = useState([]);
    const [archivedEvents, setArchivedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPoster, setSelectedPoster] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [selectedArchivedEvent, setSelectedArchivedEvent] = useState(null); // For Split Modal
    const [viewRegistrations, setViewRegistrations] = useState(null); // For Faculty View
    const [managingAchievements, setManagingAchievements] = useState(null); // For Achievements Modal (Active Events)
    const [registrationsList, setRegistrationsList] = useState([]); // Stores fetched registrations

    // Create Event State
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', date: '', venue: '', registration_deadline: '', event_type: 'Workshop',
        participation_type: 'individual', min_team_size: 1, max_team_size: 1, image_poster: '', eligibility: [],
        contact_email: '', contact_phone: '', is_open: true, attachments: [],
        coordinator_name: '', coordinator_details: '', target_departments: []
    });

    const [regForm, setRegForm] = useState({
        team_name: '', team_size: 1, member_details: '', student_phone: '',
        student_email: '', id_proof_url: '', payment_screenshot_url: '', contact_type: 'phone',
        // Individual fields for lead/student
        student_name: '', registration_number: '', branch: '', section: '', year: ''
    });
    const [teamMembers, setTeamMembers] = useState([]); // Array for extra members


    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/college/events');
            const allEvents = res.data;
            
            // ARCHIVE LOGIC: Event Date + 48 Hours
            const now = new Date();
            const active = [];
            const archived = [];

            allEvents.forEach(evt => {
                const eventDate = new Date(evt.date);
                const archiveThreshold = new Date(eventDate.getTime() + 48 * 60 * 60 * 1000); // +48 Hours

                if (now > archiveThreshold) {
                    archived.push(evt);
                } else {
                    active.push(evt);
                }
            });

            // Sort active by nearest date first
            active.sort((a,b) => new Date(a.date) - new Date(b.date));
            // Sort archived by most recent first
            archived.sort((a,b) => new Date(b.date) - new Date(a.date));

            setActiveEvents(active);
            setArchivedEvents(archived);
            setEvents(allEvents);
        } catch (err) {
            console.error("Fetch Events Failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...newEvent,
                date: newEvent.date ? new Date(newEvent.date).toISOString() : null,
                registration_deadline: newEvent.registration_deadline ? new Date(newEvent.registration_deadline).toISOString() : null,
                min_team_size: parseInt(newEvent.min_team_size || 1),
                max_team_size: parseInt(newEvent.max_team_size || 1),
                eligibility: Array.isArray(newEvent.eligibility) ? newEvent.eligibility : [],
                target_departments: Array.isArray(newEvent.target_departments) ? newEvent.target_departments : [],
                attachments: newEvent.attachments 
            };
            if (payload.participation_type === 'individual') { payload.min_team_size = 1; payload.max_team_size = 1; }
            
            await api.post('/college/events', payload);
            setShowCreateModal(false);
            fetchEvents();
            setNewEvent({
                title: '', description: '', date: '', venue: '', registration_deadline: '', event_type: 'Workshop',
                participation_type: 'individual', min_team_size: 1, max_team_size: 1, image_poster: '', eligibility: [],
                contact_email: '', contact_phone: '', is_open: true, attachments: [],
                coordinator_name: '', coordinator_details: '', target_departments: []
            });
        } catch (err) { alert(`Failed: ${err.response?.data?.detail || "Error"}`); }
    };
    
    const handleDeleteEvent = async (id) => {
        if(!window.confirm("Delete this event?")) return;
        try { await api.delete(`/college/events/${id}`); fetchEvents(); } catch (err) { alert("Delete failed"); }
    };

    const handleViewRegistrations = async (event) => {
        try {
            const res = await api.get(`/college/events/${event.id}/registrations`);
            setRegistrationsList(res.data);
            setViewRegistrations(event);
        } catch (err) { alert("Failed to fetch registrations"); }
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/upload/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.url; // Assuming returns { url: ... }
        } catch (err) {
            alert("Upload failed");
            return null;
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        
        // Prepare payload
        let payload = { ...regForm };
        
        if (selectedEvent.participation_type === 'team') {
            // Validate Team Size
            const currentSize = 1 + teamMembers.length; // Lead + Members
            if (currentSize < selectedEvent.min_team_size || currentSize > selectedEvent.max_team_size) {
                 alert(`Team size must be between ${selectedEvent.min_team_size} and ${selectedEvent.max_team_size}. Current: ${currentSize}`);
                 return;
            }
            payload.team_size = currentSize;
            
            // Serialize Members including Lead? Or just extra members.
            // Let's store extra members in member_details as JSON.
            // The Lead's info is stored in the main columns (student_id derived from auth token, but we can store raw inputs too if model supports).
            // Model has student_phone, branch etc.
            
            // Format: Array of objects
            payload.member_details = JSON.stringify(teamMembers);
        }

        try {
            await api.post(`/college/events/${selectedEvent.id}/register`, payload);
            alert("Registration Successful! 🚀");
            setSelectedEvent(null);
            fetchEvents();
        } catch (err) { 
            console.error(err);
            const detail = err.response?.data?.detail;
            alert(`Failed: ${typeof detail === 'object' ? JSON.stringify(detail, null, 2) : (detail || "Error")}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-100 py-20">
                 {/* ... (Keep existing Header Animations) ... */}
                 <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                 <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                 
                 <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                             <CinematicReveal>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                                    <Sparkles className="w-3 h-3" /> Campus Life
                                </div>
                             </CinematicReveal>
                             <CinematicReveal delay={0.1}>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                                    Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Events</span>
                                </h1>
                             </CinematicReveal>
                             <CinematicReveal delay={0.2}>
                                <p className="text-slate-500 max-w-xl text-base font-medium">
                                    Discover workshops, hackathons, and cultural fests happening around you.
                                </p>
                             </CinematicReveal>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'faculty') && (
                            <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 group">
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Create Event
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-20">
                {/* ACTIVE EVENTS */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => <div key={i} className="h-80 rounded-2xl bg-white animate-pulse" />)}
                    </div>
                ) : activeEvents.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
                        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-slate-900">No upcoming active events</h2>
                        <p className="text-slate-500 text-sm">Check the archive for past events.</p>
                    </div>
                ) : (
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {activeEvents.map((event) => {
                             const isOpen = event.is_open && (!event.registration_deadline || new Date(event.registration_deadline) > new Date());
                             return (
                                <motion.div 
                                    key={event.id}
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    className="group relative glass-card rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 flex flex-col h-full ring-1 ring-white/60"
                                >
                                    {/* (Keep existing Event Card UI for Active Events) - Same as before */}
                                    <div className="h-64 relative overflow-hidden shrink-0 glass-panel-gradient">
                                         {event.image_poster ? (
                                            <img src={event.image_poster} alt={event.title} className="w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Calendar className="w-20 h-20 text-white/40 etched-icon" /></div>
                                        )}
                                        <div className="absolute top-5 left-5 z-20 glass-badge rounded-2xl p-4 text-center min-w-[75px]">
                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-2xl font-black text-slate-800 leading-none">{new Date(event.date).getDate()}</div>
                                        </div>
                                        {/* Admin Delete */}
                                        {(user?.role === 'admin' || (user?.role === 'faculty' && event.created_by === user.id)) && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="absolute top-5 right-5 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col relative milky-glass p-7 z-20 -mt-6 rounded-t-[2.5rem] border-t border-white/80">
                                         <h3 className="text-2xl font-black text-slate-800 mb-2">{event.title}</h3>
                                         <p className="text-slate-500 text-sm line-clamp-2 mb-6">{event.description}</p>
                                          <div className="mt-auto">
                                            {(user?.role === 'admin' || user?.role === 'faculty') ? (
                                                <>
                                                <button 
                                                    onClick={() => handleViewRegistrations(event)}
                                                    className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    <Users className="w-4 h-4" /> View Registrations ({event.registration_count})
                                                </button>
                                                <button 
                                                    onClick={() => setManagingAchievements(event)}
                                                    className="w-full mt-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                                                >
                                                    <Trophy className="w-4 h-4 text-amber-500" /> Manage Achievements
                                                </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => { 
                                                        if (event.is_registered) return;
                                                        setSelectedEvent(event); 
                                                        setRegForm(prev => ({ 
                                                            ...prev, 
                                                            student_name: user?.name, 
                                                            registration_number: user?.registration_number || '', 
                                                            branch: user?.branch || '', 
                                                            section: user?.section || '', 
                                                            year: user?.year || '', 
                                                            student_email: user?.email || '', 
                                                            contact_type: 'phone',
                                                            team_size: 1 
                                                        })); 
                                                        setTeamMembers([]); 
                                                    }}
                                                    disabled={!isOpen || event.is_registered}
                                                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${
                                                        event.is_registered 
                                                            ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg cursor-default' 
                                                            : isOpen 
                                                                ? 'neon-button text-white' 
                                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {event.is_registered ? (
                                                        <>Registered <CheckCircle className="w-4 h-4" /></>
                                                    ) : isOpen ? (
                                                        <>Register <ArrowRight className="w-4 h-4" /></>
                                                    ) : 'Closed'}
                                                </button>
                                            )}
                                          </div>
                                    </div>
                                </motion.div>
                             )
                        })}
                    </motion.div>
                )}

                {/* ARCHIVE SECTION */}
                {archivedEvents.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="border-t border-slate-200 pt-10"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Archive className="w-5 h-5" /></div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Previous Events Archive</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {archivedEvents.map((evt) => (
                                <motion.div 
                                    key={evt.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedArchivedEvent(evt)}
                                    className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all group"
                                >
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                                        {evt.image_poster ? (
                                            <img src={evt.image_poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <Calendar className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="font-bold text-slate-900 truncate mb-1">{evt.title}</h4>
                                        <p className="text-xs text-slate-500 mb-2 line-clamp-1">{new Date(evt.date).toLocaleDateString(undefined, {dateStyle:'medium'})}</p>
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600">
                                            View Details <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* SPLIT MODAL FOR ARCHIVE */}
            <AnimatePresence>
                {selectedArchivedEvent && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-md">
                        <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.9 }}
                             className="bg-white w-full max-w-5xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
                        >
                            <button onClick={() => setSelectedArchivedEvent(null)} className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white md:text-white dark:text-white transition-colors">
                                <X className="w-6 h-6 drop-shadow-md" />
                            </button>

                            {/* LEFT: POSTER (50%) */}
                            <div className="w-full md:w-1/2 h-64 md:h-full bg-slate-900 relative overflow-hidden">
                                {selectedArchivedEvent.image_poster ? (
                                    <>
                                        <div className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50" style={{ backgroundImage: `url(${selectedArchivedEvent.image_poster})` }} />
                                        <img src={selectedArchivedEvent.image_poster} className="relative z-10 w-full h-full object-contain p-4" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">No Poster Available</div>
                                )}
                                <div className="absolute bottom-6 left-6 z-20 hidden md:block">
                                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs font-mono">
                                        <Clock className="w-3 h-3" /> Ended on {new Date(selectedArchivedEvent.date).toLocaleDateString()}
                                     </div>
                                </div>
                            </div>

                            {/* RIGHT: DETAILS (50%) */}
                            <div className="w-full md:w-1/2 h-full bg-white p-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest mb-3">
                                            {selectedArchivedEvent.event_type}
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                                            {selectedArchivedEvent.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(selectedArchivedEvent.date).toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</span>
                                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedArchivedEvent.venue}</span>
                                        </div>
                                    </div>

                                    <div className="prose prose-slate prose-sm max-w-none">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About Event</h4>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedArchivedEvent.description}</p>
                                    </div>

                                    {/* Stats / Highlights (Mocked for now since it is archived) */}
                                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Participation</div>
                                            <div className="text-xl font-black text-indigo-900">{selectedArchivedEvent.participation_type === 'individual' ? 'Individual' : 'Teams'}</div>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Status</div>
                                            <div className="text-xl font-black text-emerald-900">Completed</div>
                                        </div>
                                    </div>
                                    
                                    {selectedArchivedEvent.attachments && selectedArchivedEvent.attachments.length > 0 && (
                                        <div className="pt-6">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resources</h4>
                                            <div className="space-y-2">
                                                {selectedArchivedEvent.attachments.map((att, i) => (
                                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group/att">
                                                        <FileText className="w-4 h-4 text-slate-400 group-hover/att:text-indigo-500" />
                                                        <span className="text-sm font-bold text-slate-700 flex-1">{att.name}</span>
                                                        <Download className="w-4 h-4 text-slate-300 group-hover/att:text-indigo-500" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                     {/* ACHIEVEMENTS SECTION (Public) */}
                                     <div className="pt-6 border-t border-slate-100">
                                        <AchievementList eventId={selectedArchivedEvent.id} readOnly={true} className="mt-4" />
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MANAGE ACHIEVEMENTS MODAL (Active) */}
            <AnimatePresence>
                {managingAchievements && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0f1115] w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-white/10">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><Trophy className="text-amber-400" size={20} /> Event Achievements</h2>
                                    <p className="text-xs text-gray-400">{managingAchievements.title}</p>
                                </div>
                                <button onClick={() => setManagingAchievements(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <AchievementList eventId={managingAchievements.id} readOnly={false} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* KEEP EXISTING CREATE & REGISTER MODALS HERE */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[1.5rem] shadow-2xl flex flex-col">
                            {/* ... Content of Create Modal (Same as original) ... */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div><h2 className="text-xl font-bold text-slate-900">Create Event</h2></div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Event Title</label>
                                            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-bold outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                            <select className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium outline-none" value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}>
                                                <option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Cultural</option><option>Sports</option><option>Webinar</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label><textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none min-h-[100px]" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Event Date & Time</label><input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reg. Deadline</label><input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={newEvent.registration_deadline} onChange={e => setNewEvent({...newEvent, registration_deadline: e.target.value})} /></div>
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Venue</label><input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} required /></div>
                                    
                                    {/* POSTER SECTION */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Event Poster</label>
                                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit mb-2">
                                            <button type="button" onClick={() => setSelectedPoster('url')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedPoster === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Link URL</button>
                                            <button type="button" onClick={() => setSelectedPoster('upload')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedPoster === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Upload File</button>
                                        </div>
                                        {selectedPoster === 'upload' ? (
                                            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50">
                                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={async (e) => {
                                                    if(e.target.files[0]) {
                                                        const url = await handleFileUpload(e.target.files[0]);
                                                        if(url) setNewEvent({...newEvent, image_poster: url});
                                                    }
                                                }} accept="image/*" />
                                                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                                <p className="text-xs text-slate-500 font-medium">Click to browse or drop file here</p>
                                                {newEvent.image_poster && <p className="text-[10px] text-emerald-600 font-bold mt-2 truncate">Uploaded! {newEvent.image_poster.split('/').pop()}</p>}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none pl-10" placeholder="https://..." value={newEvent.image_poster} onChange={e => setNewEvent({...newEvent, image_poster: e.target.value})} />
                                                <LinkIcon className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* TARGETING SECTION */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Branches</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA'].map(dept => (
                                                    <button 
                                                        key={dept} type="button"
                                                        onClick={() => {
                                                            const current = newEvent.target_departments || [];
                                                            const updated = current.includes(dept) ? current.filter(d => d !== dept) : [...current, dept];
                                                            setNewEvent({...newEvent, target_departments: updated});
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newEvent.target_departments?.includes(dept) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                                    >
                                                        {dept}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1.5">Selected: {newEvent.target_departments?.length ? newEvent.target_departments.join(", ") : "All Branches (Default)"}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Years</label>
                                            <div className="flex gap-2">
                                                {['1', '2', '3', '4'].map(year => (
                                                    <button 
                                                        key={year} type="button"
                                                        onClick={() => {
                                                            const current = newEvent.eligibility || [];
                                                            const updated = current.includes(year) ? current.filter(y => y !== year) : [...current, year];
                                                            setNewEvent({...newEvent, eligibility: updated});
                                                        }}
                                                        className={`w-10 h-10 rounded-lg text-sm font-black border transition-all ${newEvent.eligibility?.includes(year) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'}`}
                                                    >
                                                        {year}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1.5">Selected: {newEvent.eligibility?.length ? newEvent.eligibility.map(y=>y+" Year").join(", ") : "All Years (Default)"}</p>
                                        </div>
                                    </div>
                                    
                                    {/* ATTACHMENTS SECTION */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                         <label className="block text-xs font-bold text-slate-500 uppercase">Attachments / Resources</label>
                                         <div className="space-y-2">
                                             {(newEvent.attachments || []).map((att, idx) => (
                                                 <div key={idx} className="flex gap-2">
                                                     <input placeholder="Name" className="flex-1 bg-white p-2 rounded-lg border border-slate-200 text-xs" value={att.name} onChange={e => {
                                                         const up = [...(newEvent.attachments || [])]; up[idx].name = e.target.value; setNewEvent({...newEvent, attachments: up});
                                                     }} />
                                                     <input placeholder="URL" className="flex-[2] bg-white p-2 rounded-lg border border-slate-200 text-xs" value={att.url} onChange={e => {
                                                         const up = [...(newEvent.attachments || [])]; up[idx].url = e.target.value; setNewEvent({...newEvent, attachments: up});
                                                     }} />
                                                     <button type="button" onClick={() => {
                                                         const up = (newEvent.attachments || []).filter((_,i)=>i!==idx); setNewEvent({...newEvent, attachments: up});
                                                     }} className="p-2 text-red-400 hover:bg-white rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                 </div>
                                             ))}
                                             <div className="flex gap-2">
                                                 <button type="button" onClick={() => setNewEvent({...newEvent, attachments: [...(newEvent.attachments||[]), {name: '', url: ''}]})} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Link</button>
                                                  <label className="cursor-pointer text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                                     <input type="file" className="hidden" onChange={async (e) => {
                                                         if(e.target.files[0]) {
                                                             const url = await handleFileUpload(e.target.files[0]);
                                                             if(url) setNewEvent({...newEvent, attachments: [...(newEvent.attachments||[]), {name: e.target.files[0].name, url: url}]});
                                                         }
                                                     }} />
                                                     + Upload File
                                                 </label>
                                             </div>
                                         </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700">Participation Type</label>
                                            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                                <button type="button" onClick={() => setNewEvent({...newEvent, participation_type: 'individual'})} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${newEvent.participation_type === 'individual' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Individual</button>
                                                <button type="button" onClick={() => setNewEvent({...newEvent, participation_type: 'team'})} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${newEvent.participation_type === 'team' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Team</button>
                                            </div>
                                        </div>
                                        {newEvent.participation_type === 'team' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Team Size</label><input type="number" min="1" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none" value={newEvent.min_team_size} onChange={e => setNewEvent({...newEvent, min_team_size: e.target.value})} /></div>
                                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Team Size</label><input type="number" min="1" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none" value={newEvent.max_team_size} onChange={e => setNewEvent({...newEvent, max_team_size: e.target.value})} /></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coordinator Name</label><input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={newEvent.coordinator_name} onChange={e => setNewEvent({...newEvent, coordinator_name: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coordinator Details</label><input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" placeholder="Phone / Email" value={newEvent.coordinator_details} onChange={e => setNewEvent({...newEvent, coordinator_details: e.target.value})} /></div>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 my-4" />
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-sm">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Publish Event</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                             <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0"><h2 className="text-lg font-bold text-slate-900">Confirm Registration</h2><p className="text-xs text-slate-500 mt-0.5">For <span className="text-indigo-600 font-semibold">{selectedEvent.title}</span></p></div>
                             <form onSubmit={handleRegister} className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                                 <div className="space-y-3">
                                     {selectedEvent.participation_type === 'team' ? (
                                         <div className="space-y-3">
                                             <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-800">
                                                 <span className="font-bold">Team Registration Required</span>
                                                 <div className="mt-1">Size: {selectedEvent.min_team_size} - {selectedEvent.max_team_size} members</div>
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Team Name</label>
                                                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none font-bold" value={regForm.team_name} onChange={e => setRegForm({...regForm, team_name: e.target.value})} required placeholder="e.g. The Avengers" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Team Size</label>
                                                      <div className="p-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">{1 + teamMembers.length} (Lead + {teamMembers.length})</div>
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Leader Phone</label>
                                                      <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none" value={regForm.student_phone} onChange={e => setRegForm({...regForm, student_phone: e.target.value})} required />
                                                  </div>
                                             </div>

                                             {/* TEAM LEAD DETAILS (EDITABLE) */}
                                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between">
                                                     <span>Team Lead (Your Details)</span>
                                                     <span className="text-slate-300 text-[9px] font-medium normal-case">Please verify your info</span>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-3">
                                                     <div>
                                                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                                                         <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-indigo-500 transition-colors" value={regForm.student_name} onChange={e => setRegForm({...regForm, student_name: e.target.value})} placeholder="Full Name" required />
                                                     </div>
                                                     <div>
                                                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Registration No.</label>
                                                         <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-indigo-500 transition-colors" value={regForm.registration_number} onChange={e => setRegForm({...regForm, registration_number: e.target.value})} placeholder="Regd. No" required />
                                                     </div>
                                                     <div>
                                                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch</label> 
                                                         <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-indigo-500 transition-colors" value={regForm.branch} onChange={e => setRegForm({...regForm, branch: e.target.value})} placeholder="Branch" required />
                                                     </div>
                                                      <div>
                                                         <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Section</label>
                                                         <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-indigo-500 transition-colors" value={regForm.section} onChange={e => setRegForm({...regForm, section: e.target.value})} placeholder="Section" required />
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* DYNAMIC MEMBERS */}
                                             <div className="space-y-2">
                                                 <div className="flex items-center justify-between">
                                                     <label className="block text-[10px] font-bold text-slate-500 uppercase">Team Members</label>
                                                     {(1 + teamMembers.length) < selectedEvent.max_team_size && (
                                                         <button type="button" onClick={() => setTeamMembers([...teamMembers, { name: '', reg_no: '', branch: '', section: '' }])} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Member</button>
                                                     )}
                                                 </div>
                                                 
                                                 {teamMembers.map((member, idx) => (
                                                     <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative group">
                                                         <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                             <span>Member {idx + 1}</span>
                                                             <button type="button" onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                                                         </div>
                                                         <div className="grid grid-cols-2 gap-2">
                                                             <input placeholder="Name" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" value={member.name} onChange={e => { const newM = [...teamMembers]; newM[idx].name = e.target.value; setTeamMembers(newM); }} required />
                                                             <input placeholder="Regd. No" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" value={member.reg_no} onChange={e => { const newM = [...teamMembers]; newM[idx].reg_no = e.target.value; setTeamMembers(newM); }} required />
                                                             <input placeholder="Branch" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" value={member.branch} onChange={e => { const newM = [...teamMembers]; newM[idx].branch = e.target.value; setTeamMembers(newM); }} required />
                                                             <input placeholder="Section (e.g. A)" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none" value={member.section} onChange={e => { const newM = [...teamMembers]; newM[idx].section = e.target.value; setTeamMembers(newM); }} required />
                                                         </div>
                                                     </div>
                                                 ))}
                                                 
                                                 {teamMembers.length === 0 && (
                                                     <div className="text-center py-4 text-xs text-slate-400 italic">No additional members added yet.</div>
                                                 )}
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="space-y-3">
                                             <div>
                                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none" value={regForm.student_name} onChange={e => setRegForm({...regForm, student_name: e.target.value})} required />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                                                      <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none" placeholder="A, B, C..." />
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                                                      <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none" value={regForm.student_phone} onChange={e => setRegForm({...regForm, student_phone: e.target.value})} required />
                                                  </div>
                                             </div>
                                         </div>
                                     )}

                                      <div className="pt-2 flex gap-3">
                                          <button type="button" onClick={() => setSelectedEvent(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">Cancel</button>
                                          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                              {selectedEvent.participation_type === 'team' ? 'Register Team' : 'Confirm Registration'}
                                          </button>
                                      </div>
                                 </div>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW REGISTRATIONS MODAL */}
            <AnimatePresence>
                {viewRegistrations && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{viewRegistrations.title}</h2>
                                    <p className="text-xs text-slate-500">Registrations ({registrationsList.length})</p>
                                </div>
                                <button onClick={() => setViewRegistrations(null)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 font-bold text-slate-500 uppercase">Student</th>
                                            <th className="p-4 font-bold text-slate-500 uppercase">Roll No</th>
                                            <th className="p-4 font-bold text-slate-500 uppercase">Team</th>
                                            <th className="p-4 font-bold text-slate-500 uppercase">Contact</th>
                                            <th className="p-4 font-bold text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {registrationsList.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-medium text-slate-900">
                                                    <div>{reg.student_name}</div>
                                                    <div className="text-[10px] text-slate-400">{reg.branch} - {reg.section}</div>
                                                </td>
                                                <td className="p-4 text-slate-600 font-mono">{reg.registration_number}</td>
                                                <td className="p-4">
                                                    {reg.team_name ? (
                                                        <div>
                                                            <div className="font-bold text-indigo-600">{reg.team_name}</div>
                                                            <div className="text-[10px] text-slate-400">Size: {reg.team_size}</div>
                                                            {reg.member_details && (
                                                                <div className="text-[9px] text-slate-400 max-w-[150px] truncate" title={JSON.stringify(JSON.parse(reg.member_details || '[]'), null, 2)}>
                                                                    Members: {JSON.parse(reg.member_details || '[]').map(m=>m.name).join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-slate-400">-</span>}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    <div>{reg.student_phone}</div>
                                                    <div className="text-[10px] text-slate-400">{reg.student_email}</div>
                                                </td>
                                                <td className="p-4"><span className="inline-flex px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Confirmed</span></td>
                                            </tr>
                                        ))}
                                        {registrationsList.length === 0 && (
                                            <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No registrations yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Events;
