import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');

    // Redirect to Landing if no role specified (avoids generic "Portal Login")
    React.useEffect(() => {
        if (!role) {
            navigate('/', { replace: true });
        }
    }, [role, navigate]);

    // Professional, Deep Color Palettes
    const getTheme = () => {
        switch(role) {
            case 'student': return { 
                name: 'Student',
                gradient: 'from-blue-900 via-indigo-900 to-slate-900', // Deep Ocean
                accent: 'text-indigo-600',
                button: 'bg-indigo-900 hover:bg-indigo-800',
                iconBg: 'bg-indigo-50 text-indigo-900'
            };
            case 'faculty': return { 
                name: 'Faculty',
                gradient: 'from-emerald-900 via-teal-900 to-slate-900', // Deep Academic Green
                accent: 'text-teal-700',
                button: 'bg-teal-900 hover:bg-teal-800',
                iconBg: 'bg-teal-50 text-teal-900'
            };
            case 'admin': return { 
                name: 'Administrator',
                gradient: 'from-slate-900 via-gray-900 to-black', // Onyx/Platinum
                accent: 'text-slate-700',
                button: 'bg-slate-900 hover:bg-slate-800',
                iconBg: 'bg-slate-100 text-slate-900'
            };
            default: return { 
                name: 'Portal',
                gradient: 'from-slate-800 to-slate-900',
                accent: 'text-slate-600',
                button: 'bg-slate-900 hover:bg-slate-800',
                iconBg: 'bg-slate-100 text-slate-500'
            };
        }
    };

    const theme = getTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            console.log("Login Success:", user);
            
            // Strict Role Check allowed?
            // If user is admin, allow them to login to student portal? Usually no, separate portals.
            // If role param exists, enforce it.
            if (role && user.role !== role) {
                // If the user signed up as Student but tries to login as Faculty -> Deny
                // But if they are just logging in without specific role param (e.g. from main landing), allow.
                console.warn(`Role Mismatch: Expected ${role}, Got ${user.role}`);
                alert(`Access Denied: This portal is for ${role}s. You are a ${user.role}.`);
                await logout();
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            // Check if it's a server error or credential error
            let msg = "Invalid credentials or Server Error";
            if (err.response) {
                // Server responded with a status code
                msg = err.response.data?.detail || `Error: ${err.response.status} ${err.response.statusText}`;
            } else if (err.request) {
                // Request made but no response (Network Error)
                msg = "Network Error: Cannot reach server. Check your connection or IP.";
            } else {
                msg = err.message;
            }
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // REDUCED SIZE: max-w-[1000px] and min-h-[600px] instead of 1200x750
                // This ensures it fits on smaller laptop screens without scrolling
                className="w-full max-w-[1000px] min-h-[550px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex"
            >
                {/* LEFT SIDE: Professional Liquid Motion */}
                <div className="hidden lg:block w-[45%] relative overflow-hidden">
                    {/* Deep Background Base */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

                    {/* Fluid Morphing Blobs (Scaled down for new size) */}
                    <motion.div 
                        animate={{ 
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 -left-16 w-[400px] h-[400px] bg-white/5 rounded-[40%] blur-[60px] mix-blend-overlay"
                    />
                     <motion.div 
                        animate={{ 
                            y: [0, 50, 0],
                            scale: [1.2, 1, 1.2],
                            rotate: [0, -15, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-16 -right-16 w-[500px] h-[500px] bg-white/10 rounded-[45%] blur-[80px] mix-blend-soft-light"
                    />
                    
                    {/* Glass Overlay Text */}
                    <div className="absolute inset-0 flex flex-col justify-between p-10 z-10">
                        <div>
                             <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl mb-6">
                                U
                             </div>
                             <h1 className="text-3xl font-bold text-white font-display leading-tight tracking-tight">
                                Academic<br/>Excellence<br/>Platform.
                             </h1>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-white/80 text-xs font-light leading-relaxed">
                                    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Clean Professional Form */}
                {/* Reduced Padding: p-8 lg:p-12 */}
                <div className="w-full lg:w-[55%] p-8 lg:p-14 flex flex-col justify-center bg-white relative">
                    <div className="absolute top-8 right-8">
                         <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                            Change Portal
                         </Link>
                    </div>

                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${theme.accent} mb-1 block`}>
                                Welcome Back
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 font-display">
                                {theme.name} Login
                            </h2>
                            <p className="text-slate-500 mt-1 text-xs">
                                Secure access to the university portal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-xs text-red-600">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className={`p-1.5 rounded-lg ${theme.iconBg} transition-colors group-focus-within:bg-slate-200`}>
                                               <User className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-0 focus:border-slate-800 transition-all shadow-sm group-hover:border-slate-300"
                                            placeholder="id@university.edu"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className={`p-1.5 rounded-lg ${theme.iconBg} transition-colors group-focus-within:bg-slate-200`}>
                                               <Lock className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-0 focus:border-slate-800 transition-all shadow-sm group-hover:border-slate-300"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                    {/* Link moved to bottom */}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-3 px-6 rounded-xl shadow-lg shadow-gray-200 text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 ${theme.button}`}
                            >
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                             <Link to="/forgot-password" className="text-[10px] font-semibold text-slate-500 hover:text-slate-800">
                                Forgot Password?
                             </Link>
                             {(!role || role === 'student') && (
                                <Link to={`/signup?role=student`} className={`text-[10px] font-bold ${theme.accent} hover:underline`}>
                                    Create an Account
                                </Link>
                             )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
