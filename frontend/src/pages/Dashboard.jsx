import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import api from '../services/api';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import AdminDashboard from './dashboards/AdminDashboard'; 
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (e) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    // Role-Based Router
    switch(user.role) {
        case 'student': 
            return <StudentDashboard user={user} stats={stats} />;
        case 'faculty':
            return <FacultyDashboard user={user} stats={stats} />;
        case 'admin':
            return <AdminDashboard user={user} stats={stats} />;
        default:
            return <StudentDashboard user={user} stats={stats} />;
    }
};

export default Dashboard;
