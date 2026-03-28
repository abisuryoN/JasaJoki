import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useAuth } from '../AuthContext';
import { getEcho } from '../utils/echo';
import {
    FaComments, FaTimes, FaPaperPlane, FaUserAstronaut,
    FaRobot, FaWhatsapp, FaInfoCircle, FaChevronRight,
    FaCheck, FaCheckDouble, FaExclamationTriangle
} from 'react-icons/fa';
import { useChat } from '../ChatContext';

export default function ChatWidget() {
    const { user } = useAuth();
    const chat = useChat() || {};
    const {
        isConnected = false,
        isConnecting = false,
        processedMessageIds = { current: new Set() }
    } = chat;
    const [isOpen, setIsOpen] = useState(false);
    const [roomId, setRoomId] = useState(localStorage.getItem('chatRoomId'));
    const [messages, setMessages] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isGuestForm, setIsGuestForm] = useState(!roomId && !user);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const [isAdminOnline, setIsAdminOnline] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastRoomIdRef = useRef(null);
    const pendingQueueRef = useRef([]);

    useEffect(() => {
        if (user) fetchUserRoom();
    }, [user]);

    const appendMessage = (msg) => {
        if (!msg.id || processedMessageIds.current.has(msg.id)) return;
        if (msg.id && typeof msg.id === 'number' && msg.id > 1000000000000) { /* temp id, skip set */ }
        else { processedMessageIds.current.add(msg.id); }

        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== msg.id && m.tempId !== msg.tempId);
            return [msg, ...filtered];
        });
    };

    // ✅ EXTRACTED SUBSCRIPTION LOGIC
    const subscribeToRoom = (id) => {
        if (!id) return;
        const echo = getEcho();
        if (!echo) return;

        console.log(`📡 Widget Subscribing: chat.${id}`);

        echo.private(`chat.${id}`)
            .listen('MessageSent', (e) => {
                console.log('📩 Widget Message:', e);
                appendMessage(e.message);
                if (isOpen) markAsRead(id);
            })
            .listen('MessageRead', (e) => {
                setMessages(prev => prev.map(m =>
                    e.messageIds.includes(m.id) ? { ...m, is_read: true } : m
                ));
            })
            .listen('TypingEvent', (e) => {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (e.user !== (currentUser?.name || guestName)) setIsAdminTyping(e.isTyping);
            });

        echo.join(`chat-room.${id}`)
            .here((users) => setIsAdminOnline(users.some(u => u.role === 'admin')))
            .joining((u) => { if (u.role === 'admin') setIsAdminOnline(true); })
            .leaving((u) => { if (u.role === 'admin') setIsAdminOnline(false); });

        return () => {
            echo.leave(`chat.${id}`);
            echo.leave(`chat-room.${id}`);
        };
    };

    // ✅ AUTO RE-SUBSCRIBE & INITIAL JOIN
    useEffect(() => {
        if (!roomId) return;

        const cleanup = subscribeToRoom(roomId);
        fetchMessages(roomId);

        const handleReconnect = () => {
            console.log('🔄 Re-syncing Widget Chat...');
            subscribeToRoom(roomId);
            fetchMessages(roomId);
        };

        window.addEventListener('ws:reconnected', handleReconnect);
        return () => {
            if (cleanup) cleanup();
            window.removeEventListener('ws:reconnected', handleReconnect);
        };
    }, [roomId]);

    // ✅ MESSAGE QUEUE PROCESSOR
    useEffect(() => {
        if (isConnected && pendingQueueRef.current.length > 0) {
            console.log(`📤 Sending ${pendingQueueRef.current.length} queued messages...`);
            const queue = [...pendingQueueRef.current];
            pendingQueueRef.current = [];
            queue.forEach(msgFunc => msgFunc());
        }
    }, [isConnected]);

    const fetchUserRoom = async () => {
        try {
            const res = await api.get('/chat/rooms/user');
            if (res.data) {
                setRoomId(res.data.id);
                localStorage.setItem('chatRoomId', res.data.id);
                setIsGuestForm(false);
            }
        } catch (error) { console.error('No auto-room found', error); }
    };

    const fetchMessages = async (id, cursor = null) => {
        if (cursor) setLoadingMore(true);
        try {
            const res = await api.get(`/chat/rooms/${id}/messages${cursor ? `?cursor=${cursor}` : ''}`);
            const newMsgs = res.data.data;
            setMessages(prev => cursor ? [...prev, ...newMsgs] : newMsgs);
            setNextCursor(res.data.next_cursor);
            if (!cursor && isOpen) markAsRead(id);
        } catch (error) { console.error(error); } finally { setLoadingMore(false); }
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && nextCursor && !loadingMore) {
            fetchMessages(roomId, nextCursor);
        }
    };

    const markAsRead = async (id) => {
        const targetId = id || roomId;
        if (!targetId) return;
        try { await api.post(`/chat/rooms/${targetId}/read`); } catch (err) { console.error(err); }
    };

    const handleStartChat = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/chat/rooms', { guest_name: guestName });
            setRoomId(res.data.id);
            localStorage.setItem('chatRoomId', res.data.id);
            setIsGuestForm(false);
            setMessages([]);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // ✅ OPTIMISTIC SEND
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !roomId) return;

        const text = newMessage;
        const tempId = Date.now();
        setNewMessage('');

        const optimisticMsg = {
            id: tempId,
            tempId: tempId,
            message: text,
            sender_id: user?.id,
            sender_type: user ? 'user' : 'guest',
            created_at: new Date().toISOString(),
            is_pending: true
        };

        setMessages(prev => [optimisticMsg, ...prev]);

        clearTimeout(typingTimeoutRef.current);
        api.post(`/chat/rooms/${roomId}/typing`, { is_typing: false });

        const performSend = async () => {
            try {
                const res = await api.post(`/chat/rooms/${roomId}/messages`, { message: text });
                setMessages(prev => prev.map(m => m.tempId === tempId ? res.data : m));
                if (res.data.id) processedMessageIds.current.add(res.data.id);
            } catch (error) {
                console.error(error);
                setMessages(prev => prev.filter(m => m.tempId !== tempId));
            }
        };

        if (!isConnected) {
            console.log('📦 Message queued (Offline)');
            pendingQueueRef.current.push(performSend);
        } else {
            performSend();
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (roomId) {
            clearTimeout(typingTimeoutRef.current);
            api.post(`/chat/rooms/${roomId}/typing`, { is_typing: true });
            typingTimeoutRef.current = setTimeout(() => {
                api.post(`/chat/rooms/${roomId}/typing`, { is_typing: false });
            }, 3000);
        }
    };

    useEffect(() => {
        if (!loadingMore) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAdminTyping, isOpen]);

    return (
        <div className="fixed bottom-8 left-8 z-[999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom left' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass w-[380px] h-[580px] mb-6 rounded-[32px] flex flex-col overflow-hidden border-white/20 shadow-2xl bg-slate-900/40 relative z-50"
                    >
                        {(!isConnected || isConnecting) && (
                            <div className="bg-red-600/95 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2 relative z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                                <FaExclamationTriangle className="animate-pulse" /> ⚠️ WebSocket terputus, menghubungkan...
                            </div>
                        )}

                        <header className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                                <FaComments size={80} />
                            </div>
                            <div className="flex items-center justify-between relative z-10 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-sm">
                                        <FaUserAstronaut size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-base tracking-tight leading-none mb-1.5 flex items-center gap-2 uppercase">
                                            KONSULTASI <span className={`w-1.5 h-1.5 rounded-full ${isAdminOnline ? 'bg-emerald-400 animate-pulse outline outline-emerald-400/30' : 'bg-white/30'}`} />
                                        </h3>
                                        <p className="text-[10px] text-blue-100 font-extrabold uppercase tracking-[0.2em] opacity-80 leading-none">{isAdminOnline ? 'Admin Aktif' : 'Admin Offline'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-90">
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto bg-slate-900/80 p-6 flex flex-col custom-scrollbar relative z-10">
                            {isGuestForm ? (
                                <div className="my-auto space-y-6">
                                    <div className="text-center space-y-2">
                                        <h4 className="text-xl font-black text-white leading-tight">Siap Bantu Tugasmu! 🚀</h4>
                                        <p className="text-xs text-slate-500 font-medium">Beri tahu kami nama Anda untuk memulai.</p>
                                    </div>
                                    <form onSubmit={handleStartChat} className="space-y-4">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nama Keren Kamu"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-black placeholder-slate-600 shadow-inner italic"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !guestName}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
                                        >
                                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>MULAI KONSUL <FaChevronRight size={10} /></>}
                                        </button>
                                    </form>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3 shadow-inner">
                                        <FaInfoCircle className="text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-black uppercase tracking-tighter italic">Privasi terjamin. Data klien hanya untuk kepentingan konsultasi perihal pengerjaan sistem.</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onScroll={handleScroll}
                                    className="flex-1 flex flex-col-reverse space-y-4 space-y-reverse"
                                >
                                    <div ref={messagesEndRef} />

                                    {isAdminTyping && (
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-slate-700/50 shadow-sm">
                                                <div className="flex gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-blue-400 font-black ml-1 uppercase tracking-tighter italic opacity-50">Admin Sedang Mengetik...</span>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender_type === 'user' || msg.sender_type === 'guest';
                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] px-5 py-3.5 rounded-[22px] text-[13px] font-medium leading-relaxed relative shadow-sm ${isMe
                                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10'
                                                        : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                                                    } ${msg.is_pending ? 'opacity-60 grayscale-[40%] blur-[0.2px]' : ''}`}>
                                                    {msg.message}
                                                    <div className={`flex items-center gap-1.5 mt-2 text-[8px] font-black uppercase tracking-widest opacity-60 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span>{msg.created_at ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(msg.created_at)) : ''}</span>
                                                        {isMe && (
                                                            msg.is_pending ? <span className="animate-pulse">...</span> : (msg.is_read ? <FaCheckDouble size={8} className="text-rose-400" /> : <FaCheck size={8} />)
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {loadingMore && <div className="text-center py-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}

                                    {messages.length === 0 && !loading && (
                                        <div className="my-auto text-center space-y-4 opacity-20">
                                            <FaRobot size={48} className="mx-auto" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Siap melayani pengerjaan mams!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </main>

                        {!isGuestForm && (
                            <footer className="p-4 bg-slate-950/80 border-t border-white/5 relative z-20 flex-shrink-0">
                                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleTyping}
                                        disabled={!isConnected}
                                        placeholder={isConnected ? "Ketik pesan konsultasi..." : "Menghubungkan..."}
                                        className={`flex-1 pl-6 pr-14 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder-slate-600 shadow-inner ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || !isConnected}
                                        className="absolute right-2.5 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-90 shadow-lg shadow-blue-600/20 active:translate-y-0.5"
                                    >
                                        <FaPaperPlane size={14} />
                                    </button>
                                </form>
                            </footer>
                        )}

                        <div className="p-3 bg-slate-950 text-center border-t border-white/5 flex-shrink-0">
                            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-700 hover:text-emerald-500 transition-all tracking-widest flex items-center justify-center gap-2 uppercase leading-none active:scale-95">
                                <FaWhatsapp size={10} /> Fast Response via WhatsApp
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 border border-white/10 relative z-50 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-blue-600 shadow-blue-600/30 active:rotate-12'}`}
            >
                {isOpen ? <FaTimes size={24} /> : (
                    <div className="relative">
                        <FaComments size={28} />
                        <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-500 border-2 border-blue-600 rounded-full animate-pulse shadow-sm" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}