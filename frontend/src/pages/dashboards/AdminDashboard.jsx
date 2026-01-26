import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Server, Activity, FileText, AlertTriangle, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CinematicReveal } from '../../components/ui/CinematicReveal';

const AdminDashboard = ({ user, stats }) => {
  const container = { show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto p-2 sm:p-4">
      
      {/* Cinematic Hero (Onyx Theme) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#0f1014] text-white shadow-2xl shadow-violet-900/20 min-h-[300px] flex items-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-[#0f1014] to-black z-0" />
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-violet-600/30 rounded-full blur-[128px] pointer-events-none animate-pulse" />
        
        <div className="relative z-10 p-8 sm:p-12 w-full flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
            <div className="space-y-2">
                 <CinematicReveal delay={0.1}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-medium uppercase tracking-wider mb-2">
                        <Shield className="w-3 h-3 mr-2" />
                        System Administrator
                    </div>
                 </CinematicReveal>

                <div className="overflow-hidden">
                    <CinematicReveal delay={0.2} className="mb-1">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-violet-100 via-white to-violet-300">
                            Command Center
                        </h1>
                    </CinematicReveal>
                </div>

                <CinematicReveal delay={0.4}>
                     <p className="text-violet-200/60 text-lg sm:text-xl max-w-xl">
                        System operating at <span className="text-emerald-400 font-bold">100% capacity</span>. No critical anomalies detected.
                    </p>
                </CinematicReveal>
            </div>

            {/* Quick Stats Widget */}
             <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="hidden md:flex gap-4"
            >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col items-center min-w-[120px]">
                    <span className="text-3xl font-bold text-white mb-1">{stats?.users || 142}</span>
                    <span className="text-[10px] uppercase font-bold text-violet-300 tracking-wider">Total Users</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col items-center min-w-[120px]">
                    <span className="text-3xl font-bold text-white mb-1">{stats?.events || 8}</span>
                    <span className="text-[10px] uppercase font-bold text-fuchsia-300 tracking-wider">Active Events</span>
                </div>
            </motion.div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        
        {/* Left Col: Pending Actions & Logs */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Priority Alerts / Pending */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={item} className="bg-orange-50 rounded-[2rem] p-6 border border-orange-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Pending Approvals</h3>
                        </div>
                        <p className="text-slate-600 mb-6">You have <span className="font-bold text-slate-900">3 user registrations</span> and <span className="font-bold text-slate-900">2 event requests</span> awaiting verification.</p>
                        <button className="px-5 py-2.5 bg-white text-orange-600 font-bold rounded-xl shadow-sm text-sm border border-orange-200 hover:bg-orange-600 hover:text-white transition-colors">
                            Review Items
                        </button>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-violet-50 rounded-[2rem] p-6 border border-violet-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors" />
                    <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">User Management</h3>
                        </div>
                        <p className="text-slate-600 mb-6">Manage roles, permissions, and account statuses for all registered members.</p>
                        <Link to="/users" className="inline-block px-5 py-2.5 bg-white text-violet-600 font-bold rounded-xl shadow-sm text-sm border border-violet-200 hover:bg-violet-600 hover:text-white transition-colors">
                            Manage Users
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Live System Logs */}
            <motion.div variants={item} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <Activity className="w-5 h-5 mr-3 text-violet-600" />
                        Live System Logs
                    </h3>
                    <div className="flex gap-2 text-xs font-mono">
                         <span className="flex items-center text-emerald-600"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse" /> LIVE</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { time: "Just now", user: "admin@univ", action: "Accessed Dashboard", status: "success" },
                                { time: "2m ago", user: "student_john", action: "Submitted Assignment", status: "success" },
                                { time: "15m ago", user: "unknown_ip", action: "Failed Login Attempt", status: "failed" },
                                { time: "1h ago", user: "faculty_sarah", action: "Updated Gradebook", status: "success" },
                            ].map((log, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.time}</td>
                                    <td className="px-6 py-4 text-slate-900 font-bold">{log.user}</td>
                                    <td className="px-6 py-4 text-slate-600">{log.action}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {log.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>

        {/* Right Col: Server & Quick Creates */}
        <div className="lg:col-span-1 space-y-6">
            
             <motion.div variants={item} className="bg-[#0f1014] rounded-[2.5rem] p-8 text-white border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                        <Server className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-xl mb-1">Server Heartbeat</h3>
                     <p className="text-slate-500 text-sm mb-6">us-east-1a • Primary Node</p>
                     
                     <div className="flex items-end gap-3 my-4">
                        <span className="text-5xl font-black tracking-tighter">12<span className="text-lg text-emerald-500 ml-1">ms</span></span>
                     </div>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>CPU Usage</span>
                            <span>15%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-[15%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                     </div>
                </div>
             </motion.div>

             <motion.div variants={item} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                    Quick Create
                </h3>
                <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center group">
                        <div className="bg-white p-2 rounded-lg shadow-sm mr-3 group-hover:scale-110 transition-transform">
                            <Users className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-800">New User</span>
                            <span className="block text-[10px] text-slate-400">Faculty or Admin</span>
                        </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center group">
                        <div className="bg-white p-2 rounded-lg shadow-sm mr-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-800">Announcement</span>
                            <span className="block text-[10px] text-slate-400">System-wide alert</span>
                        </div>
                    </button>
                </div>
             </motion.div>

        </div>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;
