import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import Toast from '../components/ui/Toast';

const ForgotPassword = () => {
    const { sendOtp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendOtp(email, 'reset');
            setTimer(30);
            setStep(2);
            showToast(`OTP sent to ${email}`, 'success');
        } catch (err) {
             setError(err.response?.data?.detail || "Failed to send OTP. Check email.");
             showToast("Failed to send OTP. Try again.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await resetPassword({ email, otp, new_password: newPassword });
            showToast("Password Reset Successfully!", 'success');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.detail || "Reset failed. Invalid OTP?");
            showToast("Failed to reset password.", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[900px] min-h-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex"
            >
                {/* LEFT: Liquid Art (Violet/Red Theme for Alert/Reset) */}
                <div className="hidden md:block w-[45%] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-fuchsia-900" />
                    <motion.div 
                        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 -left-10 w-[300px] h-[300px] bg-white/10 rounded-[40%] blur-[50px] mix-blend-overlay"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center p-12 text-white z-10">
                        <h1 className="text-3xl font-bold font-display leading-tight mb-4">
                            Recovery<br/>Centr.
                        </h1>
                        <p className="text-white/70 text-sm font-light">
                            Don't worry. It happens to the best of us. We'll get you back in.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Form */}
                <div className="w-full md:w-[55%] p-10 flex flex-col justify-center relative">
                    <Link to="/login" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors">
                        <ChevronLeft className="w-3 h-3" /> Back
                    </Link>

                    <div className="max-w-xs mx-auto w-full mt-8">
                         <div className="mb-8 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 font-display">
                                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                            </h2>
                            <p className="text-slate-500 mt-2 text-xs">
                                {step === 1 ? 'Enter your email to receive a verification code.' : 'Enter the code and your new password.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-xs text-red-600">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                {error}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form 
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                    onSubmit={handleSendOtp}
                                >
                                    <div className="group relative">
                                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            required 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full py-3 px-6 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Code'}
                                        {!loading && <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                    onSubmit={handleReset}
                                >
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-2">
                                        <span className="text-xs text-slate-500 font-medium ml-2">{email}</span>
                                        <button type="button" onClick={() => setStep(1)} className="text-[10px] bg-white px-2 py-1 rounded shadow-sm text-slate-600 hover:text-black">Change</button>
                                    </div>

                                    <div className="group relative">
                                        <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="6-digit Code" 
                                            required 
                                            maxLength={6}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all font-mono tracking-widest"
                                            value={otp} onChange={e => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <div className="group relative">
                                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="password" 
                                            placeholder="New Password" 
                                            required 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-lg shadow-violet-200 transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Password'}
                                    </button>

                                    {timer > 0 ? (
                                        <p className="text-center text-xs text-slate-400">Resend code in {timer}s</p>
                                    ) : (
                                        <button type="button" onClick={handleSendOtp} className="w-full text-center text-xs text-slate-500 hover:text-violet-600">Resend Code</button>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
