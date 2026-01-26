import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AchievementCard from './AchievementCard';
import { Award, Plus, Trash2, X } from 'lucide-react';

const AchievementList = ({ 
    eventId = null, 
    userId = null, 
    readOnly = false,
    className = "" 
}) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        user_id: '',
        title: '',
        description: '',
        category: 'Internal',
        badge: 'Gold',
        image_url: '',
        certificate_url: ''
    });

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            let res;
            if (eventId) {
                res = await api.get(`/achievements/event/${eventId}`);
            } else if (userId === 'my') {
                res = await api.get('/achievements/my');
            } else {
                // Determine if we need to fetch 'all' or specific logic? 
                // Using 'my' as default if userId is provided but not 'my'?
                // Or if just userId is passed as a number?
                if(userId && userId !== 'my') {
                     // We don't have a specific endpoint for "get achievements of user X" protected by admin/faculty yet in the snippets showed.
                     // But assuming the 'my' endpoint is for self.
                     // Let's stick to what was working: eventId or 'my'.
                }
            }
            if(res) setAchievements(res.data);
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, [eventId, userId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/achievements/', {
                event_id: eventId,
                user_id: parseInt(formData.user_id),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                badge: formData.badge,
                image_url: formData.image_url,
                certificate_url: formData.certificate_url
            });
            setIsAddModalOpen(false);
            setFormData({ user_id: '', title: '', description: '', category: 'Internal', badge: 'Gold', image_url: '', certificate_url: '' });
            fetchAchievements();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create achievement");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/achievements/${id}`);
            fetchAchievements();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const currentUserRole = JSON.parse(localStorage.getItem('user'))?.role;
    const canManage = !readOnly && currentUserRole && ['admin', 'faculty'].includes(currentUserRole) && eventId;

    if (loading) return <div className="text-gray-400 text-sm animate-pulse">Loading achievements...</div>;

    if (!loading && achievements.length === 0 && !canManage) {
        return <div className="text-gray-500 text-sm italic">No achievements yet.</div>;
    }

    return (
        <div className={`space-y-4 ${className}`}>
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award className="text-amber-400" size={20} />
                    Achievements
                </h3>
                
                {canManage && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all"
                    >
                        <Plus size={14} />
                        Add Record
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {achievements.map((ach) => (
                    <div key={ach.id} className="relative group">
                        <AchievementCard achievement={ach} showEventName={!eventId} />
                         {canManage && (
                            <button 
                                onClick={() => handleDelete(ach.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

             {/* Add Modal */}
             {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Record Achievement</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Student ID (User ID)</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    placeholder="System User ID"
                                    value={formData.user_id}
                                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Achievement Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    placeholder="e.g. 1st Prize, Best Delegate"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50 min-h-[80px]"
                                    placeholder="Details..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Badge</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                        value={formData.badge}
                                        onChange={e => setFormData({...formData, badge: e.target.value})}
                                    >
                                        <option value="Gold">Gold</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Bronze">Bronze</option>
                                    </select>
                                    </div>
                                    <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="Internal">Internal</option>
                                        <option value="External">External</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Sports">Sports</option>
                                    </select>
                                    </div>
                            </div>
                                
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Certificate URL (Optional)</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    placeholder="https://..."
                                    value={formData.certificate_url}
                                    onChange={e => setFormData({...formData, certificate_url: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementList;
