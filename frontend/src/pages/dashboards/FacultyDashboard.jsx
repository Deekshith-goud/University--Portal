import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, CheckCircle, Upload, ArrowRight, Zap, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CinematicReveal } from '../../components/ui/CinematicReveal';
import api from '../../services/api';

const FacultyDashboard = ({ user, stats }) => {
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
      
      {/* Cinematic Hero (Emerald Theme) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#052e16] text-white shadow-2xl shadow-emerald-900/20 min-h-[300px] flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-[#052e16] to-black z-0" />
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 w-full flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
            <div className="space-y-2">
                 <CinematicReveal delay={0.1}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-medium uppercase tracking-wider mb-2">
                        <Users className="w-3 h-3 mr-2 text-emerald-400 fill-emerald-400" />
                        Faculty Portal
                    </div>
                 </CinematicReveal>
                 
                <div className="overflow-hidden">
                    <CinematicReveal delay={0.2} className="mb-1">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-50 via-white to-emerald-200">
                             Prof. {user.name.split(' ')[0]}
                        </h1>
                    </CinematicReveal>
                </div>
                
                <CinematicReveal delay={0.4}>
                     <p className="text-emerald-100/80 text-lg sm:text-xl max-w-xl leading-relaxed">
                        You have <span className="text-white font-bold decoration-emerald-500 underline decoration-2 underline-offset-4">{stats?.submissions_received || 12} new submissions</span> waiting for review.
                    </p>
                </CinematicReveal>
            </div>
            
             {/* Quick Action Widget */}
             <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="hidden md:block w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl group cursor-pointer hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-300">
                        <Upload className="w-4 h-4" /> Grading Queue
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">Data Structures</span>
                        <span className="text-emerald-200">8 pending</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[70%]" />
                    </div>
                     <div className="flex justify-between text-sm mt-2">
                        <span className="text-white font-medium">DBMS Lab</span>
                        <span className="text-emerald-200">4 pending</span>
                    </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-500 w-[40%]" />
                    </div>
                </div>
            </motion.div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Column: Schedule & Active Classes */}
        <div className="lg:col-span-8 flex flex-col gap-6">
             <motion.div variants={item} className="flex-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-xl text-slate-900 flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-emerald-600" />
                        Today's Classes
                    </h3>
                    <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Lecture Schedule</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { time: '09:00 - 10:30', subject: 'Data Structures', room: 'Hall B', students: 45, status: 'completed' },
                        { time: '11:00 - 12:30', subject: 'Advanced Algo', room: 'Lab 2', students: 30, status: 'active' },
                        { time: '14:00 - 16:00', subject: 'Mentorship', room: 'Office', students: 5, status: 'upcoming' },
                    ].map((cls, i) => (
                        <div key={i} className={`p-6 rounded-3xl border transition-all ${
                            cls.status === 'active' ? 'bg-emerald-900 text-white border-emerald-800 shadow-xl shadow-emerald-200' : 
                            'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-emerald-100 hover:shadow-md'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                                    cls.status === 'active' ? 'bg-emerald-800 text-emerald-200' : 'bg-white text-slate-400'
                                }`}>{cls.status}</span>
                                <Users className="w-4 h-4 opacity-50" />
                            </div>
                            <h4 className={`text-2xl font-bold mb-1 ${cls.status === 'active' ? 'text-white' : 'text-slate-900'}`}>{cls.subject}</h4>
                            <p className={`text-sm mb-4 ${cls.status === 'active' ? 'text-emerald-200' : 'text-slate-500'}`}>{cls.room} • {cls.students} Students</p>
                            <div className="flex items-center gap-2 text-sm font-mono opacity-80">
                                <Clock className="w-4 h-4" /> {cls.time}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

        {/* Right Column: Notices & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            <motion.div variants={item} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg text-slate-900 flex items-center mb-6">
                    <Bell className="w-5 h-5 mr-2 text-amber-500" />
                    Department Notices
                </h3>
                {loadingAnnouncements ? (
                    <div className="text-center py-4 text-slate-400 text-sm">Loading notices...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">No new notices.</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.slice(0, 3).map((ann, i) => (
                             <div key={i} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-50 hover:border-amber-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ann.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                         {ann.priority === 'urgent' ? 'High Priority' : 'General'}
                                     </span>
                                     <span className="text-[10px] text-amber-600/70 font-mono">{new Date(ann.published_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 mb-1">{ann.title}</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
                             </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div variants={item} className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] border border-emerald-100 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Quick Assignment</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Create a new assignment for your classes in seconds.</p>
                <Link to="/assignments" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                    Create Now
                </Link>
            </motion.div>

        </div>

      </motion.div>
    </div>
  );
};

export default FacultyDashboard;
