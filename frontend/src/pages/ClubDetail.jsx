import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Calendar, MessageSquare, Plus, Zap, Music, Camera, Cpu, Globe, Award, Info, ChevronRight, Star, Sparkles, Image as ImageIcon, Link, Trash2, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';

const ClubDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]); // For discussions/announcements
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [viewRegistrationsId, setViewRegistrationsId] = useState(null); // ID of event to view regs for
    const [registerEventId, setRegisterEventId] = useState(null); // ID of event to register for
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });
    const [roleModal, setRoleModal] = useState({ isOpen: false, member: null });
    const [formAttachments, setFormAttachments] = useState([{ name: '', url: '' }]); // New State for attachments

    // Helper to add attachment field
    const addAttachmentField = () => setFormAttachments([...formAttachments, { name: '', url: '' }]);
    const updateAttachmentField = (index, field, value) => {
        const updated = [...formAttachments];
        updated[index][field] = value;
        setFormAttachments(updated);
    };
    const removeAttachmentField = (index) => {
        const updated = formAttachments.filter((_, i) => i !== index);
        setFormAttachments(updated);
    };

    const showAlert = (title, message) => {
        setConfirmDialog({
            isOpen: true,
            isAlert: true,
            title,
            message,
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        });
    };
    
    const [registrations, setRegistrations] = useState([]); // List for the view modal
    const [loadingRegs, setLoadingRegs] = useState(false);
    
    // Custom Color State
    const [startColor, setStartColor] = useState('#3b82f6');
    const [endColor, setEndColor] = useState('#6366f1');
    const [isCustomColor, setIsCustomColor] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');

    // Custom Color State moved to combined useEffect above
    
    
    // Banner Presets
    const bannerPresets = [
        { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', label: 'Tech' },
        { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80', label: 'Music' },
        { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', label: 'Sports' },
        { url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80', label: 'Study' },
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', label: 'Nature' },
        { url: 'https://images.unsplash.com/photo-1515169067750-d51a79e56cd1?auto=format&fit=crop&w=800&q=80', label: 'City' }
    ];

    const [tempBanner, setTempBanner] = useState('');

    useEffect(() => {
        if (showEditModal && club) {
            setTempBanner(club.banner_image || '');
            if (club.color && !club.color.includes('from-')) {
                 const colors = club.color.split(',');
                 if (colors.length === 2) {
                     setStartColor(colors[0]);
                     setEndColor(colors[1]);
                     setIsCustomColor(true);
                     setSelectedColor(''); 
                 }
            } else {
                setIsCustomColor(false);
                setSelectedColor(club.color || '');
            }
        }
    }, [showEditModal, club]);

    useEffect(() => {
        fetchClubDetails();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'members' && id) fetchMembers();
        if (activeTab === 'events' && id) fetchEvents();
        if (activeTab === 'discussions' && id) fetchAnnouncements();
    }, [activeTab, id]);

    // ... fetchClubDetails, fetchMembers, fetchEvents ...
    const fetchClubDetails = async () => {
        try {
            const res = await api.get(`/clubs/${id}`);
            setClub(res.data);
        } catch (err) {
            console.error(err);
            navigate('/explore'); // Redirect if not found
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/clubs/${id}/members`);
            setMembers(res.data);
        } catch (err) { console.error("Failed to fetch members", err); }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get(`/clubs/${id}/events`);
            setEvents(res.data);
        } catch (err) { console.error("Failed to fetch events", err); }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get(`/clubs/${id}/announcements`);
            setAnnouncements(res.data);
        } catch (err) { console.error("Failed to fetch announcements", err); }
    };

    const handleUpdateClub = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            const res = await api.put(`/clubs/${id}`, data);
            setClub(res.data);
            setShowEditModal(false);
        } catch (err) { console.error(err); showAlert("Error", "Failed to update club"); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Data Sanitization
        data.date = new Date(data.date).toISOString();
        data.requires_registration = formData.get('requires_registration') === 'true'; 
        
        // Remove empty optional string fields to avoid '' vs null issues if any
        if (!data.image_banner) delete data.image_banner;
        if (!data.location) delete data.location;
        if (!data.image_banner) delete data.image_banner;
        if (!data.location) delete data.location;
        if (!data.event_type) delete data.event_type;
        
        // Handle logic if participation_type is missing (defaults to individual)
        if (!data.participation_type) data.participation_type = 'individual';

        try {
            await api.post(`/clubs/${id}/events`, data);
            showAlert("Success", "Event created successfully!");
            fetchEvents();
            setShowEventModal(false);
            setActiveTab('events');
        } catch (err) { 
            console.error(err); 
            const msg = err.response?.data?.detail || err.message || "Failed to create event";
            showAlert("Error", "Failed to create event: " + msg);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        if (!data.link) delete data.link;

        try {
            await api.post(`/clubs/${id}/announcements`, data);
            showAlert("Success", "Announcement posted successfully!");
            fetchAnnouncements();
            setShowAnnouncementModal(false);
            setActiveTab('discussions');
        } catch (err) { 
             console.error(err); 
             const msg = err.response?.data?.detail || err.message || "Failed to post announcement";
             showAlert("Error", "Failed to post: " + msg); 
        }
    };

    const handleUpdateRole = async (newRole) => {
        if (!roleModal.member) return;
        try {
            await api.put(`/clubs/${id}/members/${roleModal.member.id}/role?role=${newRole}`);
            fetchMembers();
            setRoleModal({ isOpen: false, member: null });
            showAlert("Success", "Role updated successfully!");
        } catch (err) { console.error(err); showAlert("Error", "Failed to update role"); }
    };

    const handleRegisterEvent = async (event, formData = {}) => {
        try {
            await api.post(`/clubs/${id}/events/${event.id}/register`, {
                team_name: formData.team_name || null,
                team_size: formData.team_size ? parseInt(formData.team_size) : 1,
                member_details: formData.member_details || null
            });
            showAlert("Success", "Registered successfully!");
            fetchEvents();
            setRegisterEventId(null);
        } catch (err) { console.error(err); showAlert("Error", "Failed to register: " + (err.response?.data?.detail || err.message)); }
    };

    const handleUnregisterEvent = async (eventId) => {
        // Use custom confirm logic here if needed, or direct call if confirming via modal
        try {
            await api.delete(`/clubs/${id}/events/${eventId}/register`);
             showAlert("Success", "Unregistered successfully.");
            fetchEvents();
        } catch (err) { console.error(err); showAlert("Error", "Failed to unregister"); }
    };

    const promptDeleteEvent = (eventId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            onConfirm: async () => {
                 try {
                    await api.delete(`/clubs/${id}/events/${eventId}`);
                    fetchEvents();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) { console.error(err); showAlert("Error", "Failed to delete event"); }
            }
        });
    };

    const promptDeleteAnnouncement = (annId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Announcement',
            message: 'Are you sure you want to delete this post?',
            onConfirm: async () => {
                try {
                    await api.delete(`/clubs/${id}/announcements/${annId}`);
                    fetchAnnouncements();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch (err) { console.error(err); showAlert("Error", "Failed to delete announcement"); }
            }
        });
    };
    
    const fetchRegistrations = async (event) => {
        setLoadingRegs(true);
        setViewRegistrationsId(event);
        try {
            const res = await api.get(`/clubs/${id}/events/${event.id}/registrations`);
            setRegistrations(res.data);
        } catch (err) { console.error(err); showAlert("Error", "Failed to fetch registrations"); }
        finally { setLoadingRegs(false); }
    };

    const handleExportCSV = () => {
        if (!registrations.length) return;
        const headers = ['Registration Number', 'Student Name', 'Branch', 'Section', 'Team Name', 'Team Size', 'Team Members'];
        const rows = registrations.map(reg => [
            reg.registration_number || '',
            reg.student_name || '',
            reg.branch || '',
            reg.section || '',
            reg.team_name || '',
            reg.team_size || '',
            reg.member_details ? `"${reg.member_details.replace(/"/g, '""')}"` : ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `registrations_${viewRegistrationsId?.title || 'event'}.csv`;
        link.click();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
    if (!club) return null;

    // Helper Component for Icons
    const ClubIcon = ({ icon, className }) => {
        const icons = { Cpu, Zap, Music, Camera, Globe, Users, Award };
        const IconComp = icons[icon] || Users;
        return <IconComp className={className} />;
    };

    // Helper for Gradients (Tailwind vs Custom Hex)
    // Helper for Gradients (Tailwind vs Custom Hex)
    // Returns { className: string, style: object }
    const getGradientStyle = (colorString) => {
        if (!colorString) return { className: 'bg-gradient-to-br from-blue-500 to-indigo-500', style: {} };
        if (colorString.includes('from-')) {
            return { className: `bg-gradient-to-br ${colorString}`, style: {} };
        }
        return { 
            className: '', // No tailwind gradient class
            style: { background: `linear-gradient(135deg, ${colorString})`, '--tw-gradient-from': colorString.split(',')[0] } 
        }; 
    };

    const themeStyle = getGradientStyle(club.color);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 pb-20">
             {/* Animated Background */}
             {/* Animated Background */}
             <div className="fixed inset-0 -z-10">
                <div 
                    className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${themeStyle.className}`} 
                    style={themeStyle.style}
                ></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Header / Banner */}
            <div 
                className={`relative h-96 overflow-hidden ${!club.banner_image ? themeStyle.className : 'bg-slate-900'}`} 
                style={!club.banner_image ? themeStyle.style : {}}
            >
                {club.banner_image ? (
                    <>
                        <img src={club.banner_image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Club Banner" />
                        <div 
                            className={`absolute inset-0 mix-blend-multiply opacity-60 ${themeStyle.className}`} 
                            style={themeStyle.style}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    </>
                ) : (
                    <>
                         <div className="absolute inset-0 bg-black/10"></div>
                         <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                    </>
                )}
                
                <div className="max-w-7xl mx-auto px-8 pt-40 relative z-10 flex flex-col md:flex-row items-end gap-8 mb-10">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-36 h-36 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-slate-800 border-4 border-white/20 backdrop-blur-md"
                    >
                         {club.banner_image ? (
                             <div 
                                className={`w-full h-full rounded-[1.3rem] flex items-center justify-center text-white ${themeStyle.className}`} 
                                style={themeStyle.style}
                             >
                                 <ClubIcon icon={club.icon} className="w-16 h-16" />
                             </div>
                         ) : (
                             <ClubIcon icon={club.icon} className="w-16 h-16" />
                         )}
                    </motion.div>
                    <div className="pb-2 flex-1">
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-6xl font-black text-white drop-shadow-xl tracking-tight mb-3"
                        >
                            {club.name}
                        </motion.h1>
                        <div className="flex items-center gap-4 text-white/90 font-medium">
                            <span className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10 shadow-lg">
                                <Users className="w-4 h-4" /> {club.member_count} Members
                            </span>
                            <span className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10 shadow-lg">
                                <Award className="w-4 h-4" /> {club.category}
                            </span>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/explore')}
                    className="absolute top-8 left-8 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all z-20 border border-white/10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-4 sticky top-28 h-fit">
                    {['overview', 'events', 'discussions', 'members'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${
                                activeTab === tab 
                                ? 'bg-white shadow-xl shadow-indigo-100 text-indigo-600 translate-x-2' 
                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-900 hover:translate-x-1'
                            }`}
                        >
                            {/* Accent Bar for Active State */}
                            {activeTab === tab && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full"></div>}
                            
                            <div className={`transition-transform duration-300 ${activeTab === tab ? 'scale-110 ml-2' : 'group-hover:scale-110'}`}>
                                {tab === 'overview' && <Info className="w-5 h-5" />}
                                {tab === 'events' && <Calendar className="w-5 h-5" />}
                                {tab === 'discussions' && <MessageSquare className="w-5 h-5" />}
                                {tab === 'members' && <Users className="w-5 h-5" />}
                            </div>
                            <span className="capitalize tracking-wide">{tab}</span>
                            {activeTab === tab && <ChevronRight className="w-4 h-4 ml-auto opacity-100 animate-in slide-in-from-left-2" />}
                        </button>
                    ))}
                    
                    {/* Admin Actions */}{user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                        <div className="pt-8 mt-8 border-t border-slate-200/60 space-y-3">
                            <button 
                                onClick={() => setShowEditModal(true)}
                                className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group ${themeStyle.className}`}
                                style={themeStyle.style}
                            >
                                <Zap className="w-5 h-5 fill-current group-hover:rotate-12 transition-transform" /> Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl"
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About Us</h2>
                                        <p className="text-slate-600 leading-relaxed text-lg">{club.description}</p>
                                    </div>
                                    
                                    {club.highlights ? (
                                        <div className="relative group">
                                            <div 
                                                className={`absolute -inset-0.5 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-1000 ${themeStyle.className}`} 
                                                style={themeStyle.style}
                                            ></div>
                                            <div className="relative bg-white rounded-2xl p-8 border border-slate-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div 
                                                        className={`p-2 rounded-lg text-white ${themeStyle.className}`} 
                                                        style={themeStyle.style}
                                                    >
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900">Highlights & Rulebook</h3>
                                                </div>
                                                <p className="text-slate-600 whitespace-pre-line leading-relaxed text-lg font-medium">{club.highlights}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Upcoming Highlights</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-lg">Hackathon 2024</h4>
                                                    <p className="text-slate-500 text-sm">Join us for a 48-hour coding sprint.</p>
                                                </div>
                                                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-3">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-lg">Weekly Meetup</h4>
                                                    <p className="text-slate-500 text-sm">Every Friday at the Innovation Hub.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'events' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Club Events</h3>
                                        {user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                            <button 
                                                onClick={() => setShowEventModal(true)}
                                                className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 ${themeStyle.className}`}
                                                style={themeStyle.style}
                                            >
                                                <Plus className="w-5 h-5" /> New Event
                                            </button>
                                        )}
                                    </div>


                                    {events.length === 0 ? (
                                        <div className="text-center py-20">
                                            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-slate-400">No active events</h3>
                                            <p className="text-slate-400">Stay tuned for upcoming workshops.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {events.map(ev => (
                                                <div key={ev.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                    {ev.image_banner && (
                                                        <div className="h-32 w-full overflow-hidden">
                                                            <img src={ev.image_banner} className="w-full h-full object-cover" alt={ev.title} />
                                                        </div>
                                                    )}
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{ev.event_type}</span>
                                                                    {ev.location && <span className="text-xs text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3" /> {ev.location}</span>}
                                                                </div>
                                                                <h4 className="font-bold text-lg text-slate-800">{ev.title}</h4>
                                                            </div>
                                                            <div className="text-right">
                                                                 <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold block mb-1">
                                                                    {new Date(ev.date).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-xs text-slate-400">{new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 line-clamp-2 my-3 text-sm">{ev.description}</p>
                                                        
                                                        {ev.requires_registration && (
                                                            <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                                                                <div className="text-xs font-bold text-slate-500">
                                                                    <Users className="w-3 h-3 inline mr-1" /> {ev.registration_count} Registered
                                                                </div>
                                                                    {user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                                                        <div className="flex items-center gap-2">
                                                                            <button 
                                                                                onClick={() => fetchRegistrations(ev)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-bold"
                                                                            >
                                                                                View List
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => promptDeleteEvent(ev.id)}
                                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Delete Event"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {ev.is_registered ? (
                                                                         <button 
                                                                            onClick={() => handleUnregisterEvent(ev.id)}
                                                                            className="px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 transition-all"
                                                                        >
                                                                            Registered ✓
                                                                        </button>
                                                                    ) : (
                                                                         <button 
                                                                            onClick={() => {
                                                                                if (ev.participation_type === 'team') {
                                                                                    setRegisterEventId(ev);
                                                                                } else {
                                                                                    handleRegisterEvent(ev);
                                                                                }
                                                                            }}
                                                                            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                                                                        >
                                                                            Register Now
                                                                        </button>
                                                                    )}
                                                                </div>
                                                        )}
                                                        {!ev.requires_registration && user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                                             <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                                                  <button 
                                                                    onClick={() => promptDeleteEvent(ev.id)}
                                                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                                                >
                                                                    Delete Event
                                                                </button>
                                                             </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                             {activeTab === 'discussions' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">Announcements</h3>
                                            <p className="text-slate-500 text-sm mt-1 font-medium">Updates, circulars, and discussions</p>
                                        </div>
                                        {user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                            <button 
                                                onClick={() => setShowAnnouncementModal(true)}
                                                className={`px-6 py-3 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group overflow-hidden relative ${themeStyle.className}`}
                                                style={themeStyle.style}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                <MessageSquare className="w-5 h-5 relative z-10" /> 
                                                <span className="relative z-10">New Post</span>
                                            </button>
                                        )}
                                    </div>
                                    {announcements.length === 0 ? (
                                        <div className="text-center py-24 relative overflow-hidden rounded-3xl bg-slate-50/50 border border-slate-100 group">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                            <div className="relative">
                                                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-12 group-hover:rotate-0 transition-all duration-500 border border-slate-50">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                        <MessageSquare className="w-10 h-10 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2">No announcements yet</h3>
                                                <p className="text-slate-500 max-w-xs mx-auto text-sm">Posts by leads and faculty will appear here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {announcements.map(ann => (

                                                <div key={ann.id} className={`group relative p-6 bg-white border rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl ${
                                                    ann.priority === 'urgent' ? 'border-red-100 shadow-red-50/50' : 
                                                    ann.priority === 'circular' ? 'border-blue-100 shadow-blue-50/50' : 'border-slate-100 shadow-slate-100/50'
                                                }`}>
                                                     {/* Decorative Gradient Background for High Priority */}
                                                     {ann.priority !== 'normal' && (
                                                         <div className={`absolute inset-0 rounded-3xl opacity-[0.03] pointer-events-none ${
                                                             ann.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                         }`}></div>
                                                     )}
                                                     
                                                     <div className="relative flex items-start gap-5">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                                                            ann.priority === 'urgent' ? 'bg-red-100 text-red-600' : 
                                                            ann.priority === 'circular' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                            {ann.priority === 'circular' ? <Link className="w-5 h-5" /> : ann.title.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {ann.priority !== 'normal' && (
                                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                                        ann.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                        {ann.priority}
                                                                    </span>
                                                                )}
                                                                <p className="text-xs text-slate-500">{new Date(ann.published_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <h4 className="font-bold text-lg text-slate-800">{ann.title}</h4>
                                                            <p className="text-slate-600 whitespace-pre-line mt-1 text-sm leading-relaxed">{ann.content}</p>
                                                            
                                                            {/* Attachments Dropdown */}
                                                            {((ann.attachments && ann.attachments.length > 0) || ann.link) && (
                                                                <div className="mt-4">
                                                                    <div className="relative inline-block text-left group/dropdown">
                                                                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm transition-colors">
                                                                            <Link className="w-4 h-4" /> Resources / Files <ChevronDown className="w-4 h-4" />
                                                                        </button>
                                                                        
                                                                        {/* Dropdown Content */}
                                                                        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-indigo-50 invisible opacity-0 translate-y-2 group-hover/dropdown:visible group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 transition-all z-20">
                                                                            <div className="p-1">
                                                                                {ann.link && (
                                                                                    <a href={ann.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Link className="w-4 h-4" /></div>
                                                                                        <span className="font-medium">Open Link</span>
                                                                                    </a>
                                                                                )}
                                                                                {ann.attachments?.map((att, idx) => (
                                                                                    <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><FileText className="w-4 h-4" /></div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="font-medium truncate">{att.name || 'Attachment'}</p>
                                                                                            <p className="text-[10px] text-slate-400">Click to view</p>
                                                                                        </div>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                                            <button 
                                                                onClick={() => promptDeleteAnnouncement(ann.id)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                                title="Delete Post"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                     </div>
                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'members' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Club Members ({members.length})</h3>
                                    </div>
                                    {/* Vertical Member Stack */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {[...members].sort((a, b) => (a.role === 'lead' ? -1 : 1)).map(member => (
                                            <div 
                                                key={member.id} 
                                                className={`p-4 rounded-xl border flex items-center justify-between transition-all bg-white hover:shadow-md ${
                                                    member.role === 'lead' ? 'border-amber-200' : 
                                                    member.role === 'coordinator' ? 'border-blue-200' : 'border-slate-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                                            member.role === 'lead' ? 'bg-amber-100 text-amber-600' : 
                                                            member.role === 'coordinator' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        {member.role === 'lead' && (
                                                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-amber-100">
                                                                <div className="bg-amber-500 p-1 rounded-full text-white">
                                                                    <Star className="w-3 h-3 fill-current" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {member.role === 'coordinator' && (
                                                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-blue-100">
                                                                <div className="bg-blue-500 p-1 rounded-full text-white">
                                                                    <Award className="w-3 h-3" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-lg">{member.name}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                            member.role === 'lead' ? 'bg-amber-50 text-amber-600' : 
                                                            member.role === 'coordinator' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                                                        }`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {user && (user.role === 'faculty' || user.role === 'admin' || club.my_role === 'lead') && (
                                                    <button 
                                                        onClick={() => setRoleModal({ isOpen: true, member })}
                                                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                    >
                                                        Change Role
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {members.length === 0 && (
                                        <div className="text-center py-20">
                                            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-slate-400">No members yet</h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>


            {/* Edit Modal */}
            {showEditModal && (
                <Modal title="Edit Club Profile" onClose={() => setShowEditModal(false)}>
                    <form onSubmit={handleUpdateClub} className="space-y-6">
                        {/* Name & Desc */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Club Name</label>
                                <input name="name" defaultValue={club.name} className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea name="description" defaultValue={club.description} className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none" rows="3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Highlights & Rules</label>
                                <textarea name="highlights" defaultValue={club.highlights} className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none" rows="4" placeholder="Enter key facts..." />
                            </div>
                        </div>

                        {/* Visual Selectors */}
                        <div className="space-y-5 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Theme Color</label>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar snap-x">
                                        {/* 1. Custom Trigger (First in list) */}
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomColor(true)}
                                            className={`relative shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px] transition-all snap-start ${isCustomColor ? 'ring-4 ring-indigo-100 scale-110' : 'hover:scale-105'}`}
                                            title="Custom Gradient"
                                        >
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-20"></div>
                                                <Plus className="absolute w-6 h-6 text-slate-700" />
                                            </div>
                                        </button>

                                        {/* 2. Presets (Round Icons) */}
                                        {[
                                            { val: "from-blue-500 to-indigo-500", label: "Blue" },
                                            { val: "from-purple-500 to-pink-500", label: "Purple" },
                                            { val: "from-emerald-500 to-teal-500", label: "Emerald" },
                                            { val: "from-orange-500 to-red-500", label: "Orange" },
                                            { val: "from-cyan-500 to-blue-600", label: "Cyan" },
                                            { val: "from-rose-500 to-pink-600", label: "Rose" },
                                            { val: "from-amber-400 to-orange-500", label: "Amber" },
                                            { val: "from-slate-700 to-slate-900", label: "Dark" },
                                            { val: "from-lime-400 to-emerald-600", label: "Lime" },
                                            { val: "from-violet-600 to-indigo-600", label: "Violet" },
                                        ].map(opt => (
                                            <label key={opt.val} className="relative shrink-0 cursor-pointer group snap-start" title={opt.label}>
                                                <input 
                                                    type="radio" 
                                                    name="color" 
                                                    value={opt.val} 
                                                    checked={!isCustomColor && selectedColor === opt.val} 
                                                    onChange={() => { setIsCustomColor(false); setSelectedColor(opt.val); }} 
                                                    className="peer sr-only" 
                                                />
                                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${opt.val} transition-all peer-checked:scale-110 peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:ring-indigo-100 shadow-sm hover:scale-105`}></div>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Custom Picker Inputs (Shows only when Custom is active) */}
                                    {isCustomColor && (
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 fade-in">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Start</label>
                                                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                                    <input type="color" value={startColor} onChange={e => setStartColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                                    <span className="text-xs font-mono text-slate-600">{startColor}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">End</label>
                                                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                                    <input type="color" value={endColor} onChange={e => setEndColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                                    <span className="text-xs font-mono text-slate-600">{endColor}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Live Preview Bar */}
                                            <div className="w-full h-2 rounded-full mt-2 hidden">
                                                 <input type="hidden" name="color" value={isCustomColor ? `${startColor},${endColor}` : ''} disabled={!isCustomColor} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Club Icon</label>
                                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                                    {['Users', 'Cpu', 'Zap', 'Music', 'Camera', 'Globe', 'Award'].map(icon => (
                                        <label key={icon} className="cursor-pointer group">
                                            <input type="radio" name="icon" value={icon} defaultChecked={club.icon === icon} className="peer sr-only" />
                                            <div className="h-12 w-12 flex items-center justify-center rounded-xl border-2 border-slate-100 peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all hover:bg-slate-50 hover:border-slate-200">
                                                <ClubIcon icon={icon} className="w-6 h-6" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Banner Section */}
                         <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-3">Banner Image</label>
                            
                            {/* Live Preview */}
                            <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-200 group">
                                {tempBanner ? (
                                    <>
                                        <img src={tempBanner} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                            <p className="text-xs text-center text-white font-medium">Preview</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        <span className="text-sm font-medium">No Banner Selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Preset Grid */}
                            <div className="grid grid-cols-6 gap-2 mb-4">
                                {bannerPresets.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.label}
                                        onClick={() => setTempBanner(preset.url)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            tempBanner === preset.url ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'
                                        }`}
                                        title={preset.label}
                                    >
                                        <img src={preset.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Link className="absolute top-3 left-3 w-5 h-5 text-slate-400" />
                                <input 
                                    name="banner_image" 
                                    value={tempBanner} 
                                    onChange={(e) => setTempBanner(e.target.value)}
                                    placeholder="Or paste custom image URL..." 
                                    className="w-full pl-10 p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm" 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <button className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Event Modal */}
            {showEventModal && (
                <Modal title="Create New Event" onClose={() => setShowEventModal(false)}>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                                <select name="event_type" className="w-full p-2 border rounded-lg bg-white">
                                    <option>Event</option>
                                    <option>Workshop</option>
                                    <option>Seminar</option>
                                    <option>Webinar</option>
                                    <option>Meetup</option>
                                    <option>Hackathon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                <input name="location" className="w-full p-2 border rounded-lg" placeholder="e.g. Auditorium" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                            <input name="title" className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image URL (Optional)</label>
                             <input name="image_banner" className="w-full p-2 border rounded-lg text-sm" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea name="description" className="w-full p-2 border rounded-lg" rows="3" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input type="datetime-local" name="date" className="w-full p-2 border rounded-lg" required />
                            </div>
                             <div className="flex items-center gap-2 pt-6">
                                <input type="checkbox" name="requires_registration" id="reg_req" value="true" className="w-5 h-5 text-indigo-600 rounded" />
                                <label htmlFor="reg_req" className="text-sm font-bold text-slate-700">Registration Required?</label>
                            </div>
                        </div>

                        
                         {/* Participation Settings */}
                         <div className="pt-4 mt-4 border-t border-slate-100">
                             <h4 className="font-bold text-sm text-slate-900 mb-3">Participation Settings</h4>
                             <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="participation_type" value="individual" defaultChecked className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm">Individual</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="participation_type" value="team" className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm">Team</span>
                                </label>
                             </div>
                         </div>

                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Create Event</button>
                    </form>

                </Modal>
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <Modal title="Post Announcement" onClose={() => setShowAnnouncementModal(false)}>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input name="title" className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority / Type</label>
                                <select name="priority" className="w-full p-2 border rounded-lg bg-white">
                                    <option value="normal">Normal Announcement</option>
                                    <option value="urgent">Urgent / Important</option>
                                    <option value="circular">Official Circular</option>
                                </select>
                            </div>
                        </div>

                        
                        {/* Dynamic Attachments */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-700">Attachments & Links</label>
                                <button type="button" onClick={addAttachmentField} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">+ Add URL</button>
                            </div>
                            <div className="space-y-3">
                                {formAttachments.map((att, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <input 
                                            placeholder="Label (e.g. Schedule PDF)" 
                                            value={att.name}
                                            onChange={(e) => updateAttachmentField(idx, 'name', e.target.value)}
                                            className="w-1/3 p-2 border rounded-lg text-sm bg-slate-50"
                                        />
                                        <input 
                                            placeholder="URL (https://...)" 
                                            value={att.url}
                                            onChange={(e) => updateAttachmentField(idx, 'url', e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm bg-slate-50 font-mono"
                                        />
                                        {formAttachments.length > 1 && (
                                            <button type="button" onClick={() => removeAttachmentField(idx)} className="p-2 text-red-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                            <textarea name="content" className="w-full p-2 border rounded-lg" rows="5" required />
                        </div>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Post Announcement</button>
                    </form>
                </Modal>
            )}

            {/* Custom Confirm Dialog */}
            {confirmDialog.isOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100">
                        <h3 className={`text-lg font-bold mb-2 ${confirmDialog.title === 'Error' ? 'text-red-600' : 'text-slate-900'}`}>{confirmDialog.title}</h3>
                        <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            {!confirmDialog.isAlert && (
                                <button 
                                    onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                            )}
                            <button 
                                onClick={confirmDialog.onConfirm}
                                className={`px-4 py-2 text-white font-bold rounded-lg shadow-lg ${
                                    confirmDialog.title === 'Error' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                }`}
                            >
                                {confirmDialog.isAlert ? 'OK' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Team Registration Modal */}
            {registerEventId && (
                <Modal title={`Register for ${registerEventId.title}`} onClose={() => setRegisterEventId(null)}>
                     <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = Object.fromEntries(new FormData(e.target));
                        handleRegisterEvent(registerEventId, formData);
                     }} className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm mb-4">
                            <strong>Note:</strong> This is a team event. Please provide your team details.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                            <input name="team_name" className="w-full p-2 border rounded-lg" required placeholder="e.g. Code Blasters" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
                                <input type="number" name="team_size" min="1" defaultValue="2" className="w-full p-2 border rounded-lg" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Team Members (Name, Reg No, Branch, Section)</label>
                            <textarea name="member_details" className="w-full p-2 border rounded-lg" rows="4" placeholder="1. John Doe (242FA0..., CSE, Sec-A)&#10;2. Jane Smith (242FA0..., ECE, Sec-B)" required />
                        </div>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Complete Registration</button>
                     </form>
                </Modal>
            )}

            {/* Role Selection Modal */}
            {roleModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100">
                         <h3 className="text-lg font-bold text-slate-900 mb-4">Change Role for {roleModal.member?.name}</h3>
                         <div className="space-y-3">
                            <button onClick={() => handleUpdateRole('member')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${roleModal.member?.role === 'member' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold"><Users className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">Member</p>
                                    <p className="text-xs text-slate-500">Regular club member</p>
                                </div>
                                {roleModal.member?.role === 'member' && <div className="ml-auto w-3 h-3 rounded-full bg-slate-900" />}
                            </button>

                            <button onClick={() => handleUpdateRole('coordinator')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${roleModal.member?.role === 'coordinator' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"><Award className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">Coordinator</p>
                                    <p className="text-xs text-slate-500">Event organizer & helper</p>
                                </div>
                                {roleModal.member?.role === 'coordinator' && <div className="ml-auto w-3 h-3 rounded-full bg-blue-600" />}
                            </button>

                            <button onClick={() => handleUpdateRole('lead')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${roleModal.member?.role === 'lead' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold"><Star className="w-5 h-5 fill-current" /></div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">Club Lead</p>
                                    <p className="text-xs text-slate-500">Full club management access</p>
                                </div>
                                {roleModal.member?.role === 'lead' && <div className="ml-auto w-3 h-3 rounded-full bg-amber-500" />}
                            </button>
                         </div>
                         <button 
                            onClick={() => setRoleModal({ isOpen: false, member: null })}
                            className="mt-6 w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* View Registrations Modal */}
            {viewRegistrationsId && (
                <Modal 
                    title="Event Registrations" 
                    onClose={() => setViewRegistrationsId(null)}
                    action={
                        registrations.length > 0 && (
                            <button 
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <Download className="w-3 h-3" /> Export CSV
                            </button>
                        )
                    }
                >
                    {loadingRegs ? (
                        <div className="h-40 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 bg-slate-50">
                                        <th className="p-3 font-bold">Reg No</th>
                                        <th className="p-3 font-bold">Student</th>
                                        <th className="p-3 font-bold">Branch/Sec</th>
                                        <th className="p-3 font-bold">Team</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-slate-400">No registrations yet.</td></tr>
                                    ) : (
                                        registrations.map(reg => (
                                            <tr key={reg.id} className="border-b border-slate-50 text-sm hover:bg-slate-50">
                                                <td className="p-3 font-mono text-slate-600">{reg.registration_number || 'N/A'}</td>
                                                <td className="p-3 font-bold text-slate-800">
                                                    {reg.student_name}
                                                    {reg.team_name && <div className="text-xs font-normal text-slate-400">Lead</div>}
                                                </td>
                                                <td className="p-3 text-slate-500">{reg.branch} - {reg.section}</td>
                                                <td className="p-3 text-slate-600">
                                                    {reg.team_name ? (
                                                        <div>
                                                            <div className="font-bold text-indigo-600">{reg.team_name}</div>
                                                            <div className="text-xs whitespace-pre-wrap">{reg.member_details}</div>
                                                        </div>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

const Modal = ({ title, onClose, children, action }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    {action}
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <span className="text-2xl leading-none">&times;</span>
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

export default ClubDetail;
