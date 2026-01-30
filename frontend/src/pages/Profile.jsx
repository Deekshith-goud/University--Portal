import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, BookOpen, Layers, Calendar, Edit2, Check, X, Activity, Camera, Save } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/ui/Toast';

const Profile = () => {
    const { user, refetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        year: '',
        branch: '',
        section: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                year: user.year || '',
                branch: user.branch || '',
                section: user.section || ''
            });
        }
    }, [user]);

    if (!user) return <div className="flex h-[50vh] items-center justify-center text-slate-400">Loading Profile...</div>;

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const payload = {};
            if (formData.name !== user.name) payload.name = formData.name;
            if (formData.email !== user.email) payload.email = formData.email;
            if (user.role === 'student') {
                if (parseInt(formData.year) !== user.year) payload.year = parseInt(formData.year);
                if (formData.branch !== user.branch) payload.branch = formData.branch;
                if (formData.section !== user.section) payload.section = formData.section;
            }

            if (Object.keys(payload).length > 0) {
                await api.put('/users/me', payload);
                await refetchUser();
                setToast({ message: "Profile updated successfully!", type: 'success' });
            }
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to update profile", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const EditableField = ({ label, value, field, type = "text", options }) => {
        const isModified = formData[field] !== user[field];
        
        if (!isEditing) {
            return (
                <div className="group">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
                </div>
            );
        }

        return (
            <div className="relative">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{label}</p>
                {options ? (
                    <select
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 text-base font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt} className="text-slate-900">{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 text-base font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                )}
                {isModified && (
                    <div className="absolute right-3 top-9 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
            </div>
        );
    };

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative space-y-8">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Header / Banner Area */}
            <div className="relative mb-8">
                {/* Cover Image */}
                <div className="h-44 w-full bg-slate-900 rounded-[1.5rem] overflow-hidden relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-indigo-950 opacity-90"></div>
                </div>

                {/* Profile Stats & Identity Wrapper */}
                <div className="px-6 sm:px-10 relative flex flex-col md:flex-row items-end -mt-14 gap-5">
                    {/* Avatar */}
                    <div className="relative group shrink-0 z-10">
                        <div className="w-28 h-28 rounded-[1.5rem] bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                            <div className="w-full h-full bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-4xl font-bold text-white shadow-inner font-sans">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Check User Identity */}
                    <div className="flex-1 mb-1.5 min-w-0 z-10 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="text-2xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-600 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-auto min-w-[200px] shadow-sm"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-sans truncate">{user.name}</h1>
                            )}
                            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : user.role === 'faculty' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {user.role}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate">{user.email}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-3 flex items-center gap-3 shrink-0 z-10">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    {loading ? 'Saving...' : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold text-xs shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Stats & Quick Info */}
                <div className="space-y-6">
                    {/* Impact Card */}
                    <div className="group bg-white dark:bg-slate-800 rounded-[2rem] p-1 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.8rem] p-8 text-white relative overflow-hidden h-full">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                                        <Activity className="w-6 h-6 text-indigo-50" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">All Time</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-5xl font-bold tracking-tight">{user.events_participated_count || 0}</h3>
                                    <p className="text-indigo-100 font-medium text-lg">Events Participated</p>
                                </div>
                            </div>
                            {/* Decor */}
                            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
                        </div>
                    </div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label={user.year ? "Year" : "Years Active"} 
                            value={user.year || "1+"} 
                            icon={Calendar} 
                            color="bg-emerald-500 text-emerald-600" 
                        />
                        <StatCard 
                            label="Branch" 
                            value={user.branch ? user.branch.slice(0,3).toUpperCase() : "GEN"} 
                            icon={BookOpen} 
                            color="bg-blue-500 text-blue-600" 
                        />
                     </div>
                </div>

                {/* Right Column: Detailed Info Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Account Information
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <EditableField 
                                label="Email Address" 
                                value={user.email} 
                                field="email"
                                type="email"
                            />
                            
                            {user.role === 'student' && (
                                <>
                                    <div className="group">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registration Number</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                                                {user.registration_number || 'Not Assigned'}
                                            </span>
                                            <Shield className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>

                                    <EditableField 
                                        label="Current Year" 
                                        value={`Year ${user.year}`} 
                                        field="year" 
                                        options={[1, 2, 3, 4]}
                                    />

                                    <EditableField 
                                        label="Branch" 
                                        value={user.branch || "Not Set"} 
                                        field="branch"
                                        type="text"
                                    />

                                    <EditableField 
                                        label="Section" 
                                        value={user.section || "Not Set"} 
                                        field="section"
                                        type="text"
                                    />
                                </>
                            )}

                             {/* Read Only Fields for everyone */}
                            {!['student'].includes(user.role) && (
                                <div>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</p>
                                     <p className="text-lg font-bold text-slate-800 dark:text-white">{user.branch || 'General Faculty'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
