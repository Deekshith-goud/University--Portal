import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, CheckCircle, ArrowRight, Zap, Award, AlertTriangle, Bell, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CinematicReveal } from '../../components/ui/CinematicReveal';
import api from '../../services/api';

const StudentDashboard = ({ user, stats }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements/');
            setAnnouncements(res.data);
        } catch (e) {
            console.error("Failed to fetch announcements");
        } finally {
            setLoadingAnnouncements(false);
        }
    };
    fetchAnnouncements();
  }, []);

  // Stagger interactions for the grid
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto p-2 sm:p-4">
      
      {/* Cinematic Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#0f1014] text-white shadow-2xl shadow-indigo-500/10 min-h-[300px] flex items-center"
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#0f1014] to-black z-0" />
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 w-full flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
            <div className="space-y-2">
                <CinematicReveal delay={0.1}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium uppercase tracking-wider mb-2">
                        <Zap className="w-3 h-3 mr-2 text-yellow-400 fill-yellow-400" />
                        Student Portal
                    </div>
                </CinematicReveal>
                
                <div className="overflow-hidden">
                    <CinematicReveal delay={0.2} className="mb-1">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                            Hello, {user.name.split(' ')[0]}
                        </h1>
                    </CinematicReveal>
                </div>
                
                <CinematicReveal delay={0.4}>
                    <p className="text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed">
                        You have <span className="text-white font-bold decoration-indigo-500 underline decoration-2 underline-offset-4">{stats?.pending_assignments || 3} deadlines</span> approaching. Let's conquer them.
                    </p>
                </CinematicReveal>
            </div>

            {/* Next Up Widget */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="hidden md:block w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
            >
                <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-widest text-indigo-300">
                    <Clock className="w-4 h-4" /> Next Up
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Advanced Algorithms</h3>
                <p className="text-slate-400 text-sm mb-4">Lecture Hall A2 • 10:30 AM</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[65%]" />
                </div>
                <div className="mt-2 text-right text-xs text-slate-500">Starting in 45m</div>
            </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid - Full Flexy */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Column (Primary Focus) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Announcements Section (NEW) */}
            <motion.div variants={item} className="p-6 bg-gradient-to-r from-indigo-50 to-white rounded-[2rem] border border-indigo-100/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center">
                        <Megaphone className="w-5 h-5 mr-3 text-indigo-600" />
                        Latest Announcements
                    </h3>
                </div>
                {loadingAnnouncements ? (
                    <div className="text-center py-4 text-slate-400 text-sm">Loading notices...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">No new announcements.</div>
                ) : (
                    <div className="space-y-3">
                        {announcements.slice(0, 3).map((ann, i) => (
                             <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${ann.priority === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                                        {ann.priority === 'urgent' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                                        <span className="text-[10px] text-slate-400">{new Date(ann.published_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
                                </div>
                             </div>
                        ))}
                         <Link to="/announcements" className="block text-center text-xs font-bold text-indigo-500 mt-2 hover:underline">View All Announcements</Link>
                    </div>
                )}
            </motion.div>

            {/* Today's Schedule Row */}
            <motion.div variants={item} className="flex-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-xl text-slate-900 flex items-center">
                        <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                        Today's Schedule
                    </h3>
                    <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
                </div>
                
                {/* Timeline */}
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-slate-100">
                    {[
                        { time: '09:00 AM', subject: 'Database Systems', type: 'Lecture', status: 'completed' },
                        { time: '10:30 AM', subject: 'Advanced Algorithms', type: 'Lecture', status: 'upcoming' },
                        { time: '02:00 PM', subject: 'Web Development Lab', type: 'Practical', status: 'future' },
                    ].map((cls, idx) => (
                        <div key={idx} className="relative pl-12 flex items-center group">
                            <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors z-10 ${
                                cls.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                cls.status === 'upcoming' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {cls.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : 
                                 cls.status === 'upcoming' ? <Clock className="w-5 h-5 animate-pulse" /> : 
                                 <div className="w-3 h-3 bg-slate-300 rounded-full" />}
                            </div>
                            <div className={`flex-1 p-5 rounded-2xl border transition-all ${
                                cls.status === 'upcoming' ? 'bg-indigo-50 border-indigo-100 shadow-sm scale-[1.02]' : 
                                'bg-white border-slate-100 hover:border-slate-200'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-bold text-lg ${cls.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{cls.subject}</h4>
                                        <p className="text-slate-500 text-sm">{cls.type} • Room 304</p>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-400">{cls.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>

        {/* Right Column (Stats & Deadlines) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                        <Award className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-900">3.8</span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mt-1">Current GPA</span>
                 </div>
                 <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-900">{stats?.pending_assignments || 3}</span>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide mt-1">Pending</span>
                 </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div variants={item} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                        Deadlines
                    </h3>
                    <Link to="/assignments" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
                </div>

                <div className="space-y-3 flex-1">
                    {[
                        { title: "Binary Search Tree", subject: "DSA", due: "Tonight, 11:59 PM", urgency: "high" },
                        { title: "SQL Portfolio", subject: "DBMS", due: "Tomorrow", urgency: "medium" },
                        { title: "React Project", subject: "Web Dev", due: "Fri, Dec 15", urgency: "low" },
                    ].map((task, i) => (
                        <div key={i} className="group flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                             <div className={`w-1.5 h-10 rounded-full mr-4 ${
                                 task.urgency === 'high' ? 'bg-red-500' : task.urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                             }`} />
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                 <p className="text-xs text-slate-500">{task.subject}</p>
                             </div>
                             <div className="text-right pl-2">
                                 <p className={`text-xs font-bold ${
                                     task.urgency === 'high' ? 'text-red-500' : 'text-slate-400'
                                 }`}>{task.due}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
