import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col justify-center items-center">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.4] bg-[length:32px_32px]" />
      
      {/* Animated Gradient Orbs (Softer for Light Mode) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200">
           <img src={logo} alt="STAMP" className="w-4 h-4 mr-2 object-contain" />
           <span className="text-sm font-medium text-slate-600">Secure Academic Portal</span>
        </div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight font-display mb-6"
          variants={itemVariants}
        >
          STAMP <span className="text-blue-600">Portal</span>
        </motion.h1>
        
        <motion.p 
          className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed"
          variants={itemVariants}
        >
          Streamlined access for students, faculty, and administration. <br className="hidden sm:block"/>
          Manage your academic journey with ease.
        </motion.p>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto"
          variants={containerVariants}
        >
            {/* Student Card */}
            <RoleCard 
                to="/login?role=student"
                icon={BookOpen}
                title="Student Portal"
                description="Access courses, view grades, and submit assignments."
                color="blue"
            />

            {/* Faculty Card */}
            <RoleCard 
                to="/login?role=faculty"
                icon={GraduationCap}
                title="Faculty Portal"
                description="Manage curriculum, grade submissions, and track progress."
                color="emerald"
            />

            {/* Admin Card */}
            <RoleCard 
                to="/login?role=admin"
                icon={ShieldCheck}
                title="Admin Portal"
                description="System configuration, user management, and oversight."
                color="purple"
            />
        </motion.div>
        
        <motion.div className="mt-20 text-slate-400 text-sm font-medium" variants={itemVariants}>
            &copy; {new Date().getFullYear()} University Portal System. secure.university.edu
        </motion.div>

      </motion.div>
    </div>
  );
};

// Reusable Role Card Component (Light Theme Variant)
const RoleCard = ({ to, icon: Icon, title, description, color }) => {
    // Dynamic color util
    const getTheme = () => {
        switch(color) {
            case 'blue': return { 
                iconBg: 'bg-blue-50', 
                iconColor: 'text-blue-600', 
                borderHover: 'group-hover:border-blue-200',
                shadowHover: 'group-hover:shadow-blue-100',
                btnText: 'text-blue-600'
            };
            case 'emerald': return { 
                iconBg: 'bg-emerald-50', 
                iconColor: 'text-emerald-600', 
                borderHover: 'group-hover:border-emerald-200',
                shadowHover: 'group-hover:shadow-emerald-100',
                btnText: 'text-emerald-600'
            };
            case 'purple': return { 
                iconBg: 'bg-purple-50', 
                iconColor: 'text-purple-600', 
                borderHover: 'group-hover:border-purple-200',
                shadowHover: 'group-hover:shadow-purple-100',
                btnText: 'text-purple-600'
            };
            default: return {};
        }
    };
    
    const theme = getTheme();

    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="flex"
        >
            <Link 
                to={to} 
                className={`group relative flex flex-col items-center w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl ${theme.shadowHover} ${theme.borderHover}`}
            >
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${theme.iconBg}`}>
                     <Icon className={`w-7 h-7 ${theme.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">{title}</h3>
                
                <p className="text-slate-500 text-center mb-8 flex-grow text-sm leading-relaxed">
                    {description}
                </p>

                <div className={`flex items-center text-sm font-semibold transition-colors duration-300 ${theme.btnText}`}>
                    Connect <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </motion.div>
    )
}

export default Landing;
