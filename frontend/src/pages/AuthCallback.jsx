import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            const handleAuth = async () => {
                try {
                    // Set token first to fetch user
                    // In our AuthContext, login(token, null) will store token 
                    // and fetchUser will be triggered by useEffect in AuthContext
                    
                    // But we want to know where to redirect based on role
                    // So we fetch manually here first
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    login(token, res.data);
                    
                    // Redirect based on role
                    if (res.data.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                } catch (error) {
                    console.error("Auth callback failed", error);
                    navigate('/login?error=auth_failed');
                }
            };
            
            handleAuth();
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-slate-400 font-medium">Menyelesaikan autentikasi...</p>
        </div>
    );
}
