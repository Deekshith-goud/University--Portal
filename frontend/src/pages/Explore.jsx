import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, Book, Globe, GraduationCap, ChevronRight, Download, ArrowLeft, BookOpen, CheckCircle, Cpu, Server, Share2, BarChart2, Laptop, Award, Users, Zap, Music, Camera, Plus, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';
// import { toast } from '../components/ui/Toast'; // Commenting out invalid import causing issues

// Helper Component for Icons
const ClubIcon = ({ icon, className }) => {
    const icons = { Cpu, Zap, Music, Camera, Globe, Users, Award };
    const IconComp = icons[icon] || Users;
    return <IconComp className={className} />;
};

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Clubs State
  const [clubs, setClubs] = useState([]);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Technical', color: 'from-blue-500 to-indigo-500', icon: 'Cpu' });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
        const res = await api.get('/clubs');
        if (Array.isArray(res.data)) {
             setClubs(res.data);
        } else {
            console.error("Invalid clubs data format:", res.data);
            setClubs([]);
        }
    } catch (err) {
        console.error("Failed to fetch clubs", err);
        setClubs([]);
    }
  };

  const departments = [
      { id: 'CSE', name: 'Computer Science', color: 'from-blue-500 to-indigo-500', syllabus: '#', timetable: '#', sections: 4 },
      { id: 'AIML', name: 'AI & Machine Learning', color: 'from-purple-500 to-indigo-500', syllabus: '#', timetable: '#', sections: 3 },
      { id: 'ECE', name: 'Electronics & Comm', color: 'from-emerald-500 to-teal-500', syllabus: '#', timetable: '#', sections: 1 },
      { id: 'DS', name: 'Data Science', color: 'from-orange-500 to-red-500', syllabus: '#', timetable: '#', sections: 1 },
      { id: 'CS', name: 'Cyber Security', color: 'from-slate-700 to-slate-900', syllabus: '#', timetable: '#', sections: 1 },
      { id: 'BT', name: 'Biotech', color: 'from-pink-500 to-rose-500', syllabus: '#', timetable: '#', sections: 1 }
  ];

  const handleCreateClub = async (e) => {
      e.preventDefault();
      try {
          await api.post('/clubs', newClub);
          // toast.success("Club created successfully!");
          alert("Club created successfully!"); // Fallback for now
          setShowCreateClub(false);
          fetchClubs();
      } catch (err) {
          // toast.error("Failed to create club");
          console.error(err);
          alert("Failed to create club");
      }
  };

  const handleJoinToggle = async (clubId, isJoined) => {
      if (isJoined) {
           navigate(`/clubs/${clubId}`);
           return;
      }
      try {
          await api.post(`/clubs/${clubId}/join`);
          // toast.success("Joined club!");
          alert("Joined club!");
          fetchClubs(); // Refresh state
      } catch (err) {
          // toast.error("Failed to join club");
          alert("Failed to join club");
      }
  };

  return (
    <div className="p-8 min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 bg-slate-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 relative z-10"
        >
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 mb-6 flex justify-center items-center gap-4 tracking-tight">
                <Compass className="w-12 h-12 text-indigo-600" />
                Explore Campus
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Discover Academics, <span className="text-indigo-600 font-bold">Clubs</span>, and <span className="text-purple-600 font-bold">Student Life</span> around you.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
            {!selectedDept ? (
                /* Department Grid View */
                <motion.div 
                    key="grid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-7xl mx-auto relative z-10 space-y-20"
                >
                    {/* DEPARTMENTS SECTION */}
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Departments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Important Link Card */}
                            <div className="col-span-full mb-4 bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 flex flex-col md:flex-row gap-6 justify-center items-center hover:shadow-lg transition-all duration-300">
                                <a href="#" className="flex items-center gap-4 px-8 py-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-indigo-100 transition-all group w-full md:w-auto">
                                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                    <Calendar className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-lg group-hover:text-indigo-700">Academic Calendar</span>
                                </a>
                                <a href="#" className="flex items-center gap-4 px-8 py-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-purple-100 transition-all group w-full md:w-auto">
                                    <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-600 transition-colors">
                                    <Book className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-lg group-hover:text-purple-700">R22 Regulations</span>
                                </a>
                            </div>

                            {departments.map((dept, idx) => (
                                <motion.button 
                                    key={dept.id}
                                    onClick={() => setSelectedDept(dept)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group relative bg-white/80 backdrop-blur-md p-6 h-60 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 border border-white/60 transition-all duration-300 text-left overflow-hidden flex flex-col"
                                >
                                    <div className={`absolute top-0 right-0 w-48 h-48 opacity-5 rounded-full blur-2xl -mr-16 -mt-16 bg-gradient-to-br ${dept.color} group-hover:opacity-10 transition-opacity duration-500`}></div>
                                    
                                    <div className="flex justify-between items-start mb-auto relative z-10 w-full">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${dept.color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                            B.TECH
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-auto">
                                        <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:scale-105 group-hover:-translate-y-1 origin-bottom-left transition-all duration-300 ease-out">{dept.id}</h3>
                                        <h4 className="text-sm font-bold text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all duration-300 delay-75">{dept.name}</h4>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* CAMPUS LIFE SECTION */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Campus Life</h2>
                                    <p className="text-slate-500 font-medium">Join a club and expand your horizons.</p>
                                </div>
                            </div>
                            {/* Faculty Create Club Button */}
                            {user.role === 'faculty' && (
                                <button 
                                    onClick={() => setShowCreateClub(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                                >
                                    <Plus className="w-5 h-5" /> Start Club
                                </button>
                            )}
                        </div>

                        {clubs.length === 0 ? (
                            <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No clubs active yet. Be the first to start one!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {clubs.map((club) => (
                                    <motion.div 
                                        key={club.id}
                                        whileHover={{ y: -5 }}
                                        className="group relative bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-2xl -mr-10 -mt-10 bg-gradient-to-br ${club.color} group-hover:opacity-10 transition-opacity`}></div>
                                        
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${club.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                                <ClubIcon icon={club.icon} className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 bg-white/50 backdrop-blur text-slate-600 rounded-lg text-xs font-bold border border-white/50">
                                                {club.member_count} Members
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors relative z-10">{club.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4 relative z-10 line-clamp-2">{club.description}</p>
                                        
                                        <button 
                                            onClick={() => handleJoinToggle(club.id, club.is_joined)}
                                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg relative z-10 flex items-center justify-center gap-2 ${
                                                club.is_joined 
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' 
                                                : 'bg-slate-900 text-white hover:bg-rose-600 shadow-slate-900/10 group-hover:shadow-rose-600/20'
                                            }`}
                                        >
                                            {club.is_joined ? (
                                                <>Open Club <ChevronRight className="w-3 h-3" /></>
                                            ) : (
                                                <>Join Club <Plus className="w-3 h-3" /></>
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                /* Detail View */
                <motion.div 
                    key="detail"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", damping: 25 }}
                    className="max-w-5xl mx-auto relative z-10"
                >
                    <button 
                        onClick={() => setSelectedDept(null)}
                        className="mb-8 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur rounded-full text-slate-600 hover:text-indigo-600 hover:bg-white shadow-sm hover:shadow-md transition-all font-bold group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Departments
                    </button>

                    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white/50">
                        {/* Header */}
                        <div className={`h-64 bg-gradient-to-r ${selectedDept.color} p-12 flex items-end relative overflow-hidden`}>
                             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay"></div>
                             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
                            <div className="relative z-10">
                                <h2 className="text-7xl font-black text-white mb-2 tracking-tighter shadow-black/5 drop-shadow-lg">{selectedDept.id}</h2>
                                <p className="text-white/90 text-2xl font-medium tracking-wide flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    {selectedDept.name} Department
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Syllabus Card */}
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-indigo-600 border border-slate-100">
                                    <Book className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">Syllabus Copy</h3>
                                <p className="text-slate-500 mb-8 leading-relaxed">Download the complete R22 curriculum and course structure for {selectedDept.id}.</p>
                                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-700/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                    <Download className="w-5 h-5" /> Download PDF
                                </button>
                            </div>

                            {/* Timetable Card - Dynamic Sections */}
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-purple-200 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-purple-600 border border-slate-100">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">Class Timetables</h3>
                                <p className="text-slate-500 mb-6 leading-relaxed">
                                    {selectedDept.sections > 1 
                                        ? `Select your section for ${selectedDept.id} department.` 
                                        : `View weekly schedule for ${selectedDept.id}.`}
                                </p>
                                
                                {selectedDept.sections > 1 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from({ length: selectedDept.sections }).map((_, i) => (
                                            <button 
                                                key={i}
                                                className="py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-sm transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs group-hover/btn:bg-white group-hover/btn:text-purple-600 transition-colors">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                Section {String.fromCharCode(65 + i)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:shadow-purple-700/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                        <Download className="w-5 h-5" /> View Schedule
                                    </button>
                                )}
                            </div>
                        </div>

                            {/* SUBJECT LIST SECTION */}
                        <div className="p-12 border-t border-slate-100/80 bg-slate-50/30 backdrop-blur-sm">
                            {/* Modern Header */}
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-indigo-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Course Subjects</h2>
                                    <p className="text-slate-400 font-medium">Click a subject to find notes & resources.</p>
                                </div>
                            </div>

                            {/* Modern Glass Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                {[
                                    { name: 'Operating Systems', code: 'OS', label: 'CORE', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Cpu, desc: 'Process & Memory Management.' },
                                    { name: 'Computer Arch', code: 'CAO', label: 'HARDWARE', color: 'bg-pink-50 text-pink-600 border-pink-100', icon: Server, desc: 'Architecture & Organization.' },
                                    { name: 'Algorithm Design', code: 'DAA', label: 'CORE', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Share2, desc: 'Analysis & Optimization.' },
                                    { name: 'Prob & Stats', code: 'PSA', label: 'MATH', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: BarChart2, desc: 'Statistics & Probability.' },
                                    { name: 'Full Stack Dev', code: 'FSD', label: 'WEB', color: 'bg-violet-50 text-violet-600 border-violet-100', icon: Laptop, desc: 'MERN Stack Development.' },
                                    { name: 'Honours / Minor', code: 'MNR', label: 'EXTRA', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: Award, desc: 'Specialization Track.' }
                                ].map((sub, index) => (
                                    <motion.button 
                                        key={index} 
                                        onClick={() => window.location.href = `/resources?subject=${sub.code}`}
                                        whileHover={{ y: -5 }}
                                        className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 w-full text-left"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-10 rounded-full blur-2xl -mr-5 -mt-5 transition-opacity duration-500 ${sub.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${sub.color}`}>
                                                {sub.label}
                                            </span>
                                            <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${sub.color} bg-opacity-100`}>
                                                <sub.icon className="w-5 h-5 text-current" />
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{sub.code}</h3>
                                        <h4 className="text-sm font-semibold text-slate-500 mb-3">{sub.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                            {sub.desc}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>

                            {/* FACULTY SECTION */}
                            <div className="border-t border-slate-200/60 pt-16">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-pink-600">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Key Faculty</h2>
                                        <p className="text-slate-400 font-medium">Department Heads and Professors.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { name: 'Dr. S. K. Satpathy', role: 'HOD, CSE', area: 'Network Security', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                                        { name: 'Dr. N. Thirupathi', role: 'Professor', area: 'Data Science', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
                                        { name: 'Dr. B. Premamayudu', role: 'Assoc. Professor', area: 'Machine Learning', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
                                    ].map((prof, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm hover:bg-white hover:shadow-lg transition-all duration-300">
                                            <img src={prof.image} alt={prof.name} className="w-16 h-16 rounded-xl bg-slate-100" />
                                            <div>
                                                <h4 className="font-bold text-slate-900">{prof.name}</h4>
                                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">{prof.role}</p>
                                                <p className="text-xs text-slate-500">{prof.area}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Create Club Modal */}
        <AnimatePresence>
            {showCreateClub && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg border border-white/20"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Start a Club</h2>
                            <button onClick={() => setShowCreateClub(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Club Name</label>
                                <input 
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                    placeholder="e.g. Coding Club"
                                    value={newClub.name}
                                    onChange={e => setNewClub({...newClub, name: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium h-24 resize-none"
                                    placeholder="What is this club about?"
                                    value={newClub.description}
                                    onChange={e => setNewClub({...newClub, description: e.target.value})}
                                    required
                                />
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={newClub.category}
                                        onChange={e => setNewClub({...newClub, category: e.target.value})}
                                    >
                                        <option>Technical</option>
                                        <option>Arts & Culture</option>
                                        <option>Sports</option>
                                        <option>Social</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Color</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={newClub.color}
                                        onChange={e => setNewClub({...newClub, color: e.target.value})}
                                    >
                                        <option value="from-blue-500 to-indigo-500">Blue/Indigo</option>
                                        <option value="from-purple-500 to-pink-500">Purple/Pink</option>
                                        <option value="from-emerald-500 to-teal-500">Emerald/Teal</option>
                                        <option value="from-amber-500 to-orange-500">Amber/Orange</option>
                                        <option value="from-rose-500 to-red-500">Rose/Red</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
                                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl overflow-x-auto">
                                    {['Cpu', 'Zap', 'Music', 'Camera', 'Globe', 'Users', 'Award'].map(icon => {
                                        return (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setNewClub({...newClub, icon})}
                                                className={`p-3 rounded-lg transition-all ${newClub.icon === icon ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-indigo-500'}`}
                                            >
                                                <ClubIcon icon={icon} className="w-6 h-6" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all mt-4">
                                Create Club
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Explore;
