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

    // Create Event State
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', date: '', venue: '', registration_deadline: '', event_type: 'Workshop',
        participation_type: 'individual', min_team_size: 1, max_team_size: 1, image_poster: '', eligibility: [],
        contact_email: '', contact_phone: '', coordinator_name: '', is_open: true, attachments: []
    });

    const [regForm, setRegForm] = useState({
        team_name: '', team_size: 1, member_details: '', student_phone: '',
        student_email: '', id_proof_url: '', payment_screenshot_url: '', contact_type: 'phone',
        student_name: '', registration_number: '', branch: '', section: '', semester: ''
    });
    
    // ... (rest of code)
    


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
                attachments: newEvent.attachments 
            };
            if (payload.participation_type === 'individual') { payload.min_team_size = 1; payload.max_team_size = 1; }
            
            await api.post('/college/events', payload);
            setShowCreateModal(false);
            fetchEvents();
            setNewEvent({
                title: '', description: '', date: '', venue: '', registration_deadline: '', event_type: 'Workshop',
                participation_type: 'individual', min_team_size: 1, max_team_size: 1, image_poster: '', eligibility: [],
                contact_email: '', contact_phone: '', is_open: true, attachments: []
            });
        } catch (err) { alert(`Failed: ${err.response?.data?.detail || "Error"}`); }
    };
    
    const handleDeleteEvent = async (id) => {
        if(!window.confirm("Delete this event?")) return;
        try { await api.delete(`/college/events/${id}`); fetchEvents(); } catch (err) { alert("Delete failed"); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        try {
            await api.post(`/college/events/${selectedEvent.id}/register`, regForm);
            alert("Registration Successful! 🚀");
            setSelectedEvent(null);
            fetchEvents();
        } catch (err) { alert(`Failed: ${err.response?.data?.detail || "Error"}`); }
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
                                            <button 
                                                onClick={() => { setSelectedEvent(event); setRegForm(prev => ({ ...prev, student_name: user?.name, registration_number: user?.registration_number || '', branch: user?.branch || '', section: user?.section || '', semester: user?.semester || '', student_email: user?.email || '', contact_type: 'phone' })); }}
                                                disabled={!isOpen}
                                                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${isOpen ? 'neon-button text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                {isOpen ? <>Register <ArrowRight className="w-4 h-4" /></> : 'Closed'}
                                            </button>
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
                                </div>
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
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Event Title</label>
                                            <input 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none placeholder:text-slate-400 sm:text-lg"
                                                placeholder="e.g. Tech Summit 2024"
                                                value={newEvent.title}
                                                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                                required
                                            />
                                        </div>
                                         <div className="w-1/3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                            <select 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={newEvent.event_type}
                                                onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}
                                            >
                                                <option>Workshop</option>
                                                <option>Seminar</option>
                                                <option>Hackathon</option>
                                                <option>Cultural</option>
                                                <option>Sports</option>
                                                <option>Webinar</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                        <textarea 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none min-h-[100px]"
                                            placeholder="Detailed description of the event..."
                                            value={newEvent.description}
                                            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Event Date & Time</label>
                                            <input 
                                                type="datetime-local"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={newEvent.date}
                                                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Registration Deadline</label>
                                            <input 
                                                type="datetime-local"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={newEvent.registration_deadline}
                                                onChange={e => setNewEvent({...newEvent, registration_deadline: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Venue / Location</label>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Auditorium or Generic Meet Link"
                                            value={newEvent.venue}
                                            onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-4" />

                                {/* Participation Logic */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-600" /> Participation Settings
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                                            <select 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={newEvent.participation_type}
                                                onChange={e => setNewEvent({...newEvent, participation_type: e.target.value})}
                                            >
                                                <option value="individual">Individual</option>
                                                <option value="team">Team</option>
                                            </select>
                                        </div>
                                        {newEvent.participation_type === 'team' && (
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Min Members</label>
                                                    <input 
                                                        type="number" min="1"
                                                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                                                        value={newEvent.min_team_size} 
                                                        onChange={e => setNewEvent({...newEvent, min_team_size: e.target.value})} 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Max Members</label>
                                                    <input 
                                                        type="number" min="1"
                                                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                                                        value={newEvent.max_team_size} 
                                                        onChange={e => setNewEvent({...newEvent, max_team_size: e.target.value})} 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Eligibility - Departments & Semesters */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eligible Departments (Check specific or leave empty for all)</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA'].map(dept => (
                                                <label key={dept} className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${newEvent.eligibility.includes(dept) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={newEvent.eligibility.includes(dept)}
                                                        onChange={e => {
                                                            if (e.target.checked) setNewEvent({...newEvent, eligibility: [...newEvent.eligibility, dept]});
                                                            else setNewEvent({...newEvent, eligibility: newEvent.eligibility.filter(x => x !== dept)});
                                                        }}
                                                    />
                                                    {dept}
                                                </label>
                                            ))}
                                        </div>

                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eligible Semesters (Optional)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                <label key={sem} className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${newEvent.eligibility.includes(String(sem)) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={newEvent.eligibility.includes(String(sem))}
                                                        onChange={e => {
                                                            const s = String(sem);
                                                            if (e.target.checked) setNewEvent({...newEvent, eligibility: [...newEvent.eligibility, s]});
                                                            else setNewEvent({...newEvent, eligibility: newEvent.eligibility.filter(x => x !== s)});
                                                        }}
                                                    />
                                                    Sem {sem}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-4" />

                                {/* Imagery & Attachments */}
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-indigo-600" /> Media & Attachments
                                    </h3>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Event Poster</label>
                                         <div className="flex gap-2">
                                             <div className="flex-1 relative">
                                                <input 
                                                     className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                     placeholder="Paste Image URL or Upload..."
                                                     value={newEvent.image_poster}
                                                     onChange={e => setNewEvent({...newEvent, image_poster: e.target.value})}
                                                />
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                             </div>
                                             <label className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 font-bold text-xs cursor-pointer hover:bg-indigo-100 flex items-center gap-2 shrink-0">
                                                 <Upload className="w-3.5 h-3.5" /> Upload
                                                 <input 
                                                    type="file" 
                                                    hidden 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if(!file) return;
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const res = await api.post('/upload/file', formData, {headers: {'Content-Type': 'multipart/form-data'}});
                                                            setNewEvent({...newEvent, image_poster: `http://localhost:8000${res.data.url}`});
                                                        } catch(e) { alert("Upload error"); }
                                                    }} 
                                                />
                                             </label>
                                         </div>
                                     </div>
                                     
                                     {/* Attachments List */}
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Resources / Attachments</label>
                                         <div className="space-y-2 mb-2">
                                             {newEvent.attachments.map((att, idx) => (
                                                 <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded border border-slate-200">
                                                     <FileText className="w-4 h-4 text-slate-400" />
                                                     <span className="flex-1 truncate font-medium text-slate-700">{att.name}</span>
                                                     <button type="button" onClick={() => setNewEvent({...newEvent, attachments: newEvent.attachments.filter((_, i) => i !== idx)})} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                                                         <X className="w-4 h-4" />
                                                     </button>
                                                 </div>
                                             ))}
                                         </div>
                                         <div className="flex gap-2">
                                             <input 
                                                 className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs"
                                                 placeholder="Resource Name (e.g. Rulebook)"
                                                 id="attName"
                                             />
                                             <input 
                                                 className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs"
                                                 placeholder="URL (or upload)"
                                                 id="attUrl"
                                             />
                                             <label className="p-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200">
                                                 <Upload className="w-4 h-4" />
                                                 <input 
                                                    type="file" hidden 
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if(!file) return;
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                             const res = await api.post('/upload/file', formData, {headers: {'Content-Type': 'multipart/form-data'}});
                                                             document.getElementById('attUrl').value = `http://localhost:8000${res.data.url}`;
                                                             if(!document.getElementById('attName').value) document.getElementById('attName').value = file.name;
                                                        } catch(e) { alert("Upload error"); }
                                                    }}
                                                 />
                                             </label>
                                             <button 
                                                 type="button"
                                                 onClick={() => {
                                                     const name = document.getElementById('attName').value;
                                                     const url = document.getElementById('attUrl').value;
                                                     if(name && url) {
                                                         setNewEvent({...newEvent, attachments: [...newEvent.attachments, {name, url}]});
                                                         document.getElementById('attName').value = '';
                                                         document.getElementById('attUrl').value = '';
                                                     }
                                                 }}
                                                 className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                                             >
                                                 Add
                                             </button>
                                         </div>
                                     </div>
                                </div>
                                
                                <div className="h-px bg-slate-100 my-4" />
                                
                                {/* Contact Info */}
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-600" /> Event Coordinator
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coordinator Name</label>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                                            placeholder="Faculty Coordinator or Student Lead"
                                            value={newEvent.coordinator_name || ''} 
                                            onChange={e => setNewEvent({...newEvent, coordinator_name: e.target.value})} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Phone</label>
                                            <input 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                                                value={newEvent.contact_phone || ''} 
                                                onChange={e => setNewEvent({...newEvent, contact_phone: e.target.value})} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Email</label>
                                            <input 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                                                value={newEvent.contact_email || ''} 
                                                onChange={e => setNewEvent({...newEvent, contact_email: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" /> Publish Event
                                    </button>
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
                             <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0">
                                <h2 className="text-lg font-bold text-slate-900">Confirm Registration</h2>
                                <p className="text-xs text-slate-500 mt-0.5">For <span className="text-indigo-600 font-semibold">{selectedEvent.title}</span></p>
                             </div>
                             
                             <form onSubmit={handleRegister} className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                                {selectedEvent.participation_type === 'individual' ? (
                                    /* INDIVIDUAL FORM */
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={regForm.student_name} onChange={e => setRegForm({...regForm, student_name: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reg. No</label>
                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={regForm.registration_number} onChange={e => setRegForm({...regForm, registration_number: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch</label>
                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={regForm.branch} onChange={e => setRegForm({...regForm, branch: e.target.value})} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact (Phone/Email)</label>
                                            <div className="flex gap-2">
                                                <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Phone" value={regForm.student_phone} onChange={e => setRegForm({...regForm, student_phone: e.target.value})} />
                                                <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Email" value={regForm.student_email} onChange={e => setRegForm({...regForm, student_email: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* TEAM FORM */
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-900 uppercase mb-1">Team Name</label>
                                            <input className="w-full bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" value={regForm.team_name} onChange={e => setRegForm({...regForm, team_name: e.target.value})} required placeholder="e.g. The Innovators" />
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 border-b border-slate-200 pb-1">Team Lead Details (You)</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                 <input className="bg-white border border-slate-200 rounded p-1.5 text-xs" value={regForm.student_name} onChange={e=>setRegForm({...regForm, student_name:e.target.value})} placeholder="Name" required />
                                                 <input className="bg-white border border-slate-200 rounded p-1.5 text-xs" value={regForm.registration_number} onChange={e=>setRegForm({...regForm, registration_number:e.target.value})} placeholder="Reg No" required />
                                                 <input className="bg-white border border-slate-200 rounded p-1.5 text-xs" value={regForm.branch} onChange={e=>setRegForm({...regForm, branch:e.target.value})} placeholder="Branch" required />
                                                 <input className="bg-white border border-slate-200 rounded p-1.5 text-xs" value={regForm.student_phone} onChange={e=>setRegForm({...regForm, student_phone:e.target.value})} placeholder="Phone" required />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-900 uppercase mb-1">Team Members Details</label>
                                            <p className="text-[10px] text-slate-400 mb-1.5">Include Name, Reg No, Branch for each member.</p>
                                            <textarea 
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                                                placeholder={`1. Member Name, RegNo, Branch\n2. Member Name, RegNo, Branch...`}
                                                value={regForm.member_details}
                                                onChange={e => setRegForm({...regForm, member_details: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 pb-0">
                                     <button type="button" onClick={() => setSelectedEvent(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">Cancel</button>
                                     <button type="submit" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">Confirm Registration</button>
                                </div>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Events;
