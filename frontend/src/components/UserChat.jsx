import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import {
    FaUserAstronaut, FaTimes, FaCheck,
    FaCheckDouble, FaPaperPlane,
    FaExclamationTriangle, FaPaperclip, FaComments
} from 'react-icons/fa';
import { getEcho } from '../utils/echo';
import { useChat } from '../ChatContext';
import { useAuth } from '../AuthContext';

export default function UserChat() {
    const { user } = useAuth();
    const chat = useChat() || {};
    const {
        isUserOnline = () => false,
        isConnected = false,
        isConnecting = false,
        processedMessageIds = { current: new Set() }
    } = chat;

    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const [adminLastSeen, setAdminLastSeen] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const fileInputRef = useRef(null);
    const pendingQueueRef = useRef([]);

    useEffect(() => {
        if (isOpen && !room) initChat();
    }, [isOpen]);

    // ✅ appendMessage stable
    const appendMessage = useCallback((msg) => {
        if (!msg?.id) return;
        if (processedMessageIds.current.has(msg.id)) return;
        if (typeof msg.id === 'number' && msg.id > 1000000000000) return;

        processedMessageIds.current.add(msg.id);

        setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            const filtered = prev.filter(m => m.tempId !== msg.tempId);
            // Tambah di akhir (terbaru di bawah)
            return [...filtered, msg];
        });
    }, []);

    const markAsRead = useCallback(async (id) => {
        const targetId = id || room?.id;
        if (!targetId) return;
        try { await api.post(`/chat/rooms/${targetId}/read`); }
        catch (err) { console.error(err); }
    }, [room?.id]);

    // ✅ SUBSCRIPTION stable
    const subscribeToRoom = useCallback((id) => {
        if (!id) return;
        const echo = getEcho();
        if (!echo) return;

        console.log(`📡 User Subscribing: chat.${id}`);

        echo.leave(`chat.${id}`);
        echo.leave(`chat-room.${id}`);

        echo.private(`chat.${id}`)
            .listen('MessageSent', (e) => {
                console.log('📩 User Message Event:', e);
                if (e.message) {
                    appendMessage(e.message);
                    markAsRead(id);
                }
            })
            .listen('MessageRead', (e) => {
                if (e.messageIds) {
                    setMessages(prev => prev.map(m =>
                        e.messageIds.includes(m.id) ? { ...m, is_read: true } : m
                    ));
                }
            })
            .listen('TypingEvent', (e) => {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (e.user !== currentUser?.name) {
                    setIsAdminTyping(e.isTyping);
                }
            });

        echo.join(`chat-room.${id}`)
            .here((users) => {
                const admin = users.find(u => u.role === 'admin');
                if (admin) setAdminLastSeen(admin.last_seen);
            })
            .joining((u) => { if (u.role === 'admin') setAdminLastSeen(u.last_seen); })
            .leaving((u) => { if (u.role === 'admin') setAdminLastSeen(null); });

        return () => {
            echo.leave(`chat.${id}`);
            echo.leave(`chat-room.${id}`);
        };
    }, [appendMessage, markAsRead]);

    // ✅ Subscribe saat room ready
    useEffect(() => {
        const id = room?.id;
        if (!id) return;

        processedMessageIds.current = new Set();
        const cleanup = subscribeToRoom(id);
        fetchMessages(id);

        const handleReconnect = () => {
            console.log('🔄 Re-syncing User Chat...');
            subscribeToRoom(id);
            fetchMessages(id);
        };

        window.addEventListener('ws:reconnected', handleReconnect);
        return () => {
            if (cleanup) cleanup();
            window.removeEventListener('ws:reconnected', handleReconnect);
        };
    }, [room?.id]);

    // ✅ QUEUE PROCESSOR
    useEffect(() => {
        if (isConnected && pendingQueueRef.current.length > 0) {
            const queue = [...pendingQueueRef.current];
            pendingQueueRef.current = [];
            queue.forEach(fn => fn());
        }
    }, [isConnected]);

    // Auto scroll
    useEffect(() => {
        if (!loadingMore) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAdminTyping]);

    const initChat = async () => {
        setLoading(true);
        try {
            const res = await api.get('/chat/rooms/user');
            setRoom(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchMessages = async (roomId, cursor = null) => {
        if (cursor) setLoadingMore(true);
        try {
            const res = await api.get(`/chat/rooms/${roomId}/messages${cursor ? `?cursor=${cursor}` : ''}`);
            const newMsgs = res.data.data || [];

            if (cursor) {
                setMessages(prev => [...newMsgs.reverse(), ...prev]);
            } else {
                // Reverse: API return desc, kita butuh asc (terbaru di bawah)
                setMessages([...newMsgs].reverse());
                newMsgs.forEach(m => {
                    if (m.id) processedMessageIds.current.add(m.id);
                });
            }
            setNextCursor(res.data.next_cursor);
        } catch (error) { console.error(error); }
        finally { setLoadingMore(false); }
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && nextCursor && !loadingMore) {
            fetchMessages(room.id, nextCursor);
        }
    };

    const handleTyping = () => {
        if (!room) return;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            api.post(`/chat/rooms/${room.id}/typing`, { is_typing: true });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            api.post(`/chat/rooms/${room.id}/typing`, { is_typing: false });
        }, 3000);
    };

    // ✅ OPTIMISTIC SEND
    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !previewImage) || !room) return;

        const text = newMessage;
        const tempId = `temp_${Date.now()}`;
        setNewMessage('');
        setPreviewImage(null);

        // Optimistic — tambah di akhir
        const optimisticMsg = {
            id: tempId,
            tempId,
            message: text,
            sender_id: user?.id,
            // ✅ sender_type sesuai role — user biasa = 'user', guest = 'guest'
            sender_type: user ? (user.role === 'admin' ? 'admin' : 'user') : 'guest',
            message_type: previewImage ? 'image' : 'text',
            file_path: previewImage ? URL.createObjectURL(previewImage) : null,
            created_at: new Date().toISOString(),
            is_pending: true
        };

        setMessages(prev => [...prev, optimisticMsg]);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        isTypingRef.current = false;
        api.post(`/chat/rooms/${room.id}/typing`, { is_typing: false });

        const formData = new FormData();
        if (text) formData.append('message', text);
        if (previewImage) formData.append('file', previewImage);

        const performSend = async () => {
            try {
                const res = await api.post(
                    `/chat/rooms/${room.id}/messages`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setMessages(prev => prev.map(m =>
                    m.tempId === tempId ? { ...res.data, tempId } : m
                ));
                if (res.data.id) processedMessageIds.current.add(res.data.id);
            } catch (err) {
                console.error(err);
                setMessages(prev => prev.filter(m => m.tempId !== tempId));
            }
        };

        if (!isConnected) {
            pendingQueueRef.current.push(performSend);
        } else {
            performSend();
        }
    };

    const formatLastSeen = (date) => {
        if (isUserOnline(1)) return "Online";
        if (!date) return "Offline";
        const now = new Date();
        const past = new Date(date);
        const diffMins = Math.floor((now - past) / 60000);
        if (diffMins < 1) return "Baru saja aktif";
        if (diffMins < 60) return `Aktif ${diffMins} menit lalu`;
        return `Aktif ${past.toLocaleDateString('id-ID')}`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass w-[380px] h-[550px] mb-6 rounded-[32px] flex flex-col overflow-hidden border-white/20 shadow-2xl relative"
                    >
                        {(!isConnected || isConnecting) && (
                            <div className="bg-red-600/95 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2 relative z-[60]">
                                <FaExclamationTriangle className="animate-pulse" /> ⚠️ WebSocket terputus...
                            </div>
                        )}

                        <header className="p-6 bg-blue-600 flex items-center justify-between shadow-lg flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white relative border border-white/20">
                                    <FaUserAstronaut size={18} />
                                    {isUserOnline(1) && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                                    )}
                                </div>
                                {isAdminTyping ? (
                                    <div className="animate-pulse text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em]">Admin Mengetik...</div>
                                ) : (
                                    <div>
                                        <h3 className="font-black text-white text-sm tracking-tight leading-none mb-1 uppercase">KONSULTASI LIVE</h3>
                                        <span className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-widest leading-none block">
                                            {formatLastSeen(adminLastSeen)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-all active:scale-90">
                                <FaTimes size={20} />
                            </button>
                        </header>

                        {/* Messages — normal order, scroll ke bawah */}
                        <main
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 bg-slate-950/50 custom-scrollbar"
                        >
                            {loadingMore && (
                                <div className="text-center py-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            )}

                            {messages.map((msg) => {
                                // ✅ isMe: pesan dari user (bukan admin)
                                const isMe = msg.sender_type === 'user' || msg.sender_type === 'guest';
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-[20px] text-sm shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                                            } ${msg.is_pending ? 'opacity-70 grayscale-[30%]' : ''}`}>
                                            {msg.message_type === 'image' && msg.file_path && (
                                                <img
                                                    src={msg.file_path}
                                                    alt="attachment"
                                                    className="rounded-xl mb-2 max-h-60 w-full object-cover cursor-pointer"
                                                    onClick={() => window.open(msg.file_path)}
                                                />
                                            )}
                                            {msg.message && (
                                                <p className="font-medium leading-relaxed tracking-tight">{msg.message}</p>
                                            )}
                                            <div className={`flex items-center gap-1 mt-1 opacity-60 text-[8px] font-black uppercase tracking-widest ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && (
                                                    msg.is_pending
                                                        ? <span className="animate-pulse">...</span>
                                                        : (msg.is_read
                                                            ? <FaCheckDouble size={8} className="text-rose-400" />
                                                            : <FaCheck size={8} />)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={messagesEndRef} />
                        </main>

                        {previewImage && (
                            <div className="px-6 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <img src={URL.createObjectURL(previewImage)} className="w-10 h-10 object-cover rounded-lg" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gambar Dipilih</span>
                                </div>
                                <button onClick={() => setPreviewImage(null)} className="text-rose-500"><FaTimes size={14} /></button>
                            </div>
                        )}

                        <footer className="p-4 bg-slate-900 border-t border-white/5 flex-shrink-0">
                            <form onSubmit={sendMessage} className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-12 h-12 bg-white/5 hover:bg-white/10 text-white/50 rounded-2xl flex items-center justify-center border border-white/5 active:scale-95"
                                >
                                    <FaPaperclip size={16} />
                                </button>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={(e) => setPreviewImage(e.target.files[0])}
                                />
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                                    disabled={!isConnected}
                                    placeholder={isConnected ? "Ketik konsultasi..." : "Menghubungkan..."}
                                    className={`flex-1 bg-white/10 border-none rounded-2xl px-5 py-3.5 text-white placeholder-white/30 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 shadow-inner ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !previewImage) || !isConnected}
                                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
                                >
                                    <FaPaperPlane size={16} />
                                </button>
                            </form>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-slate-800' : 'bg-blue-600 shadow-blue-600/30'}`}
            >
                {isOpen ? <FaTimes size={24} className="text-white" /> : <FaComments size={24} className="text-white" />}
            </motion.button>
        </div>
    );
}