import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FaHome, FaComments, FaClipboardList, FaSignOutAlt, FaPen, FaQuestionCircle } from 'react-icons/fa';
import { useChat } from '../ChatContext';

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const chat = useChat() || {};
    const { unreadCounts = {} } = chat;
    const location = useLocation();

    const totalUnread = Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0);

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-red-500">Akses Ditolak</div>;
    }

    const menu = [
        { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
        { name: 'Live Chat', path: '/admin/chat', icon: <FaComments /> },
        { name: 'Manajemen Order', path: '/admin/orders', icon: <FaClipboardList /> },
        { name: 'Manajemen Revisi', path: '/admin/revisions', icon: <FaPen /> },
        { name: 'Halaman Bantuan', path: '/admin/help', icon: <FaQuestionCircle /> },
    ];

    return (
        <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-slate-700/50 hidden md:flex flex-col z-20">
                <div className="h-16 flex items-center justify-center border-b border-slate-700/50 shrink-0">
                    <Link to="/" className="text-xl font-bold heading-gradient">JasaJoki Admin</Link>
                </div>
                
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menu.map((item) => {
                        const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                {item.icon}
                                {item.name}
                                {item.name === 'Live Chat' && totalUnread > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg animate-pulse shadow-lg shadow-red-500/20">
                                        {totalUnread}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-700/50 shrink-0">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-600">
                            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-lg font-bold">{user.name.charAt(0)}</div>}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-200">{user.name}</p>
                            <p className="text-xs text-slate-500 pb-1">Administrator</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 glass border-b border-slate-700/50 flex items-center justify-between px-6 md:hidden shrink-0">
                    <Link to="/" className="text-lg font-bold heading-gradient">JasaJoki Admin</Link>
                    <button onClick={logout} className="text-red-400 hover:text-red-300">
                        <FaSignOutAlt size={20} />
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto bg-slate-900/50 p-6 relative">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative z-10 max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
