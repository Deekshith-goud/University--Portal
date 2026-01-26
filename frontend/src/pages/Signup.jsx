import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Key, ArrowRight, RefreshCw, Send } from 'lucide-react';
import Toast from '../components/ui/Toast';

const Signup = () => {
    const { register, sendOtp } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    // Student Details
    const [regNo, setRegNo] = useState('');


    // UX State
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null); // { message, type }
    
    // Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Handlers
    const handleSendOtp = async () => {
        if (!email) { setError("Please enter your email first."); return; }
        
        setError('');
        setLoading(true);
        try {
            await sendOtp(email, 'signup');
            setOtpSent(true);
            setTimer(30);
            showToast(`OTP sent to ${email}. Check your inbox!`, 'success');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to send OTP.");
            showToast("Failed to send OTP. Try again.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!otpSent) { setError("Please verify email first."); return; }
        
        setError('');
        setLoading(true);
        try {
            // Role is handled by backend (forced to student)
            await register({ 
                name, 
                email, 
                password, 
                otp,
                registration_number: regNo,
                // branch, section, year removed - user completes later
            });
            showToast("Account created! Redirecting to login...", 'success');
            setTimeout(() => navigate(`/login`), 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Registration failed.");
            showToast(err.response?.data?.detail || "Registration failed.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const CommonInput = ({ icon: Icon, ...props }) => (
        <div className="group relative">
            <Icon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600" />
            <input 
                {...props}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1000px] min-h-[600px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex"
            >
                {/* LEFT SIDE: Student Theme */}
                <div className="hidden lg:block w-[40%] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" />
                    <motion.div 
                        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 -left-16 w-[400px] h-[400px] bg-white/5 rounded-[40%] blur-[60px] mix-blend-overlay"
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-10 z-10">
                        <div>
                             <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl mb-6">S</div>
                             <h1 className="text-3xl font-bold text-white font-display leading-tight tracking-tight">
                                Student<br/>Portal
                             </h1>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-white/80 text-xs font-light leading-relaxed">
                                Join your peers, access resources, and stay updated with campus life.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Signup Form */}
                <div className="w-full lg:w-[60%] p-8 lg:p-10 flex flex-col justify-center bg-white relative overflow-y-auto max-h-[90vh]">
                     <div className="max-w-md mx-auto w-full">
                        <div className="mb-6">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 mb-1 block">Registration</span>
                            <h2 className="text-2xl font-bold text-slate-900 font-display">Student Sign Up</h2>
                            <p className="text-slate-500 mt-1 text-xs">Create your student account.</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-xs text-red-600">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <CommonInput 
                                    icon={User} 
                                    type="text" 
                                    placeholder="Full Name" 
                                    required 
                                    value={name} onChange={e => setName(e.target.value)} 
                                />
                                <CommonInput 
                                    icon={Key} 
                                    type="text" 
                                    placeholder="Registration Number" 
                                    required 
                                    value={regNo} onChange={e => setRegNo(e.target.value)} 
                                />
                            </div>



                            <div className="flex gap-2">
                                <div className="group relative flex-1">
                                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        placeholder="University Email" 
                                        required 
                                        disabled={otpSent}
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all ${otpSent ? 'opacity-60' : ''}`}
                                        value={email} onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                {!otpSent && (
                                    <button 
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading || !email}
                                        className="px-3 bg-indigo-900 text-white rounded-xl text-xs font-medium hover:bg-indigo-800 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify"}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {otpSent && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="space-y-3 overflow-hidden"
                                    >
                                        <CommonInput 
                                            icon={Key} 
                                            type="text" 
                                            placeholder="Enter 6-digit Code" 
                                            required 
                                            maxLength={6}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-all tracking-widest font-mono"
                                            value={otp} onChange={e => setOtp(e.target.value)} 
                                        />

                                        <CommonInput 
                                            icon={Lock} 
                                            type="password" 
                                            placeholder="Create Password" 
                                            required 
                                            value={password} onChange={e => setPassword(e.target.value)} 
                                        />

                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <span>Code sent to {email}</span>
                                            {timer > 0 ? (
                                                 <span>Resend in {timer}s</span>
                                            ) : (
                                                <button type="button" onClick={handleSendOtp} className="text-slate-600 font-bold hover:underline">Resend OTP</button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={!otpSent}
                                className="w-full py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {loading ? 'Processing...' : 'Create Student Account'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">
                                Already have an account? <Link to="/login" className="font-bold text-slate-900 hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
