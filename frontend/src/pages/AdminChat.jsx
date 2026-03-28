import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import {
    FaPaperPlane, FaUserCircle, FaSearch, FaComments,
    FaUserAstronaut, FaCheck, FaCheckDouble, FaTimes,
    FaPaperclip, FaExclamationTriangle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getEcho } from '../utils/echo';
import { useChat } from '../ChatContext';

export default function AdminChat() {
    const chat = useChat() || {};
    const {
        isUserOnline = () => false,
        isConnected = false,
        isConnecting = false,
        playNotificationSound = () => { }
    } = chat;

    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [clientLastSeen, setClientLastSeen] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const fileInputRef = useRef(null);
    const pendingQueueRef = useRef([]);
    const processedIds = useRef(new Set()); // ✅ Pakai ref lokal, bukan dari context
    const activeRoomRef = useRef(null);
    const currentSubscriptionRef = useRef(null); // ✅ Track subscription aktif

    useEffect(() => {
        activeRoomRef.current = activeRoom;
    }, [activeRoom]);

    useEffect(() => {
        fetchRooms();
    }, []);

    // ✅ Scroll ke bawah
    useEffect(() => {
        if (!loadingMore) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isUserTyping]);

    // ✅ Queue processor
    useEffect(() => {
        if (isConnected && pendingQueueRef.current.length > 0) {
            const queue = [...pendingQueueRef.current];
            pendingQueueRef.current = [];
            queue.forEach(fn => fn());
        }
    }, [isConnected]);

    // ✅ appendMessage — pakai ref, tidak butuh useCallback
    const appendMessage = (msg) => {
        if (!msg?.id) return;
        if (processedIds.current.has(msg.id)) return;
        processedIds.current.add(msg.id);
        setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            // Ganti optimistic jika ada
            const filtered = prev.filter(m => !m.tempId || m.tempId !== msg.tempId);
            return [...filtered, msg];
        });
    };

    const markAsRead = async (roomId) => {
        try {
            await api.post(`/chat/rooms/${roomId}/read`);
            setRooms(prev => prev.map(r =>
                r.id === roomId ? { ...r, unread_count: 0 } : r
            ));
        } catch (err) { console.error(err); }
    };

    // ✅ subscribeToRoom — tidak pakai useCallback, dipanggil manual
    const subscribeToRoom = (roomId) => {
        const echo = getEcho();
        if (!echo || !roomId) return;

        // ✅ Cleanup subscription lama sebelum subscribe baru
        if (currentSubscriptionRef.current) {
            const { roomId: oldRoomId } = currentSubscriptionRef.current;
            echo.leave(`chat.${oldRoomId}`);
            echo.leave(`chat-room.${oldRoomId}`);
            currentSubscriptionRef.current = null;
        }

        console.log(`📡 Admin Subscribing: chat.${roomId}`);

        echo.private(`chat.${roomId}`)
            .listen('MessageSent', (e) => {
                console.log('📩 Admin Message Event:', e);
                if (e.message) {
                    appendMessage(e.message);
                    markAsRead(roomId);
                    setRooms(prev => prev.map(r =>
                        r.id === roomId ? { ...r, messages: [e.message] } : r
                    ));
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
                    setIsUserTyping(e.isTyping);
                }
            });

        echo.join(`chat-room.${roomId}`)
            .here((users) => {
                const room = activeRoomRef.current;
                const client = users.find(u => u.id === room?.user_id);
                if (client) setClientLastSeen(client.last_seen);
            })
            .joining((u) => {
                if (u.id === activeRoomRef.current?.user_id) setClientLastSeen(u.last_seen);
            })
            .leaving((u) => {
                if (u.id === activeRoomRef.current?.user_id) setClientLastSeen(null);
            });

        // ✅ Simpan info subscription aktif
        currentSubscriptionRef.current = { roomId };
    };

    // ✅ Effect hanya jalan saat activeRoom.id berubah
    useEffect(() => {
        if (!activeRoom?.id) return;
        const id = activeRoom.id;

        // Reset state
        setMessages([]);
        setNextCursor(null);
        setIsUserTyping(false);
        setClientLastSeen(null);
        processedIds.current = new Set();

        subscribeToRoom(id);
        fetchMessages(id);

        const handleReconnect = () => {
            console.log('🔄 Re-syncing Admin Chat...');
            subscribeToRoom(id);
            fetchMessages(id);
        };

        window.addEventListener('ws:reconnected', handleReconnect);

        return () => {
            window.removeEventListener('ws:reconnected', handleReconnect);
            // ✅ Cleanup saat unmount atau room berubah
            const echo = getEcho();
            if (echo) {
                echo.leave(`chat.${id}`);
                echo.leave(`chat-room.${id}`);
            }
            currentSubscriptionRef.current = null;
        };
    }, [activeRoom?.id]); // ✅ Hanya activeRoom.id — tidak ada dependency lain

    const fetchRooms = async () => {
        try {
            const res = await api.get('/chat/rooms');
            setRooms(res.data);
            if (res.data.length > 0) setActiveRoom(res.data[0]);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchMessages = async (id, cursor = null) => {
        if (cursor) setLoadingMore(true);
        try {
            const res = await api.get(`/chat/rooms/${id}/messages${cursor ? `?cursor=${cursor}` : ''}`);
            const newMsgs = res.data.data || [];

            if (cursor) {
                setMessages(prev => [...[...newMsgs].reverse(), ...prev]);
            } else {
                // API return desc (terbaru dulu), reverse jadi asc (terbaru di bawah)
                const sorted = [...newMsgs].reverse();
                setMessages(sorted);
                sorted.forEach(m => { if (m.id) processedIds.current.add(m.id); });
                markAsRead(id);
            }
            setNextCursor(res.data.next_cursor);
        } catch (error) { console.error(error); }
        finally { setLoadingMore(false); }
    };

    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && nextCursor && !loadingMore) {
            fetchMessages(activeRoom.id, nextCursor);
        }
    };

    const handleTyping = () => {
        if (!activeRoom) return;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            api.post(`/chat/rooms/${activeRoom.id}/typing`, { is_typing: true });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            api.post(`/chat/rooms/${activeRoom.id}/typing`, { is_typing: false });
        }, 3000);
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !previewImage) || !activeRoom) return;

        const text = newMessage;
        const tempId = `temp_${Date.now()}`;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        setNewMessage('');
        setPreviewImage(null);

        const optimisticMsg = {
            id: tempId,
            tempId,
            message: text,
            sender_id: currentUser.id,
            sender_type: 'admin',
            message_type: previewImage ? 'image' : 'text',
            file_path: previewImage ? URL.createObjectURL(previewImage) : null,
            created_at: new Date().toISOString(),
            is_pending: true
        };

        setMessages(prev => [...prev, optimisticMsg]);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        isTypingRef.current = false;
        api.post(`/chat/rooms/${activeRoom.id}/typing`, { is_typing: false });

        const formData = new FormData();
        if (text) formData.append('message', text);
        if (previewImage) formData.append('file', previewImage);

        const roomIdSnapshot = activeRoom.id; // ✅ Snapshot room id

        const performSend = async () => {
            try {
                const res = await api.post(
                    `/chat/rooms/${roomIdSnapshot}/messages`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                // ✅ Register id agar tidak duplikat dari broadcast
                if (res.data.id) processedIds.current.add(res.data.id);
                setMessages(prev => prev.map(m =>
                    m.tempId === tempId ? { ...res.data, tempId: undefined } : m
                ));
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
        if (isUserOnline(activeRoom?.user_id)) return "Online";
        if (!date) return "Offline";
        const now = new Date();
        const past = new Date(date);
        const diffMins = Math.floor((now - past) / 60000);
        if (diffMins < 1) return "Baru saja aktif";
        if (diffMins < 60) return `Aktif ${diffMins} menit lalu`;
        return `Aktif ${past.toLocaleDateString('id-ID')}`;
    };

    if (loading) return (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-100px)] bg-slate-950/50 rounded-[40px] border border-slate-800/50 overflow-hidden shadow-2xl relative">
            {(!isConnected || isConnecting) && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-red-600/95 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2">
                    <FaExclamationTriangle className="animate-pulse" /> ⚠️ WebSocket terputus, menghubungkan...
                </div>
            )}

            {/* Sidebar */}
            <div className="w-80 lg:w-96 border-r border-slate-700/50 flex flex-col bg-slate-950/20">
                <div className="p-8 border-b border-slate-700/30">
                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Konsultasi Live</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Cari klien..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs font-bold focus:outline-none text-slate-200" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {rooms.map(room => (
                        <motion.div key={room.id} onClick={() => setActiveRoom(room)}
                            className={`p-4 rounded-3xl cursor-pointer transition-all flex items-center gap-4 mb-1 ${activeRoom?.id === room.id ? 'bg-blue-600 shadow-xl' : 'hover:bg-slate-800/40'}`}>
                            <div className="relative w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                                <FaUserCircle size={24} className={activeRoom?.id === room.id ? 'text-white' : 'text-slate-500'} />
                                {isUserOnline(room.user_id) && (
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                                )}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <h4 className={`font-black text-xs uppercase tracking-wider ${activeRoom?.id === room.id ? 'text-white' : 'text-slate-200'}`}>
                                    {room.user?.name || room.guest_name || 'Guest'}
                                </h4>
                                <p className={`text-[11px] truncate ${activeRoom?.id === room.id ? 'text-blue-100/70' : 'text-slate-500'}`}>
                                    {room.messages?.[0]?.message || 'Tidak ada pesan'}
                                </p>
                            </div>
                            {room.unread_count > 0 && activeRoom?.id !== room.id && (
                                <div className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center animate-bounce">
                                    {room.unread_count}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-slate-950/40">
                {activeRoom ? (
                    <>
                        <div className="p-6 border-b border-slate-800/50 flex items-center bg-slate-900/20 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                    <FaUserAstronaut size={18} />
                                </div>
                                {isUserTyping ? (
                                    <div className="animate-pulse text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                        Klien sedang mengetik...
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="font-black text-white text-base tracking-tight">
                                            {activeRoom.user?.name || activeRoom.guest_name || 'Guest'}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none block mt-1">
                                            {formatLastSeen(clientLastSeen || activeRoom.user?.last_seen)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ✅ Messages — flex-col normal, terbaru di bawah */}
                        <div onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 custom-scrollbar">
                            {loadingMore && (
                                <div className="text-center py-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            )}
                            {messages.map((msg) => {
                                const isAdmin = msg.sender_type === 'admin';
                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-3xl text-sm ${isAdmin
                                            ? 'bg-blue-600 text-white shadow-xl'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                                            } ${msg.is_pending ? 'opacity-70 grayscale' : ''}`}>
                                            {msg.message_type === 'image' && msg.file_path && (
                                                <img src={msg.file_path} alt="attachment"
                                                    className="rounded-xl mb-2 max-h-80 w-full object-cover cursor-pointer"
                                                    onClick={() => window.open(msg.file_path)} />
                                            )}
                                            {msg.message && <p className="font-medium leading-relaxed">{msg.message}</p>}
                                            <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold opacity-60 uppercase tracking-tighter justify-end">
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isAdmin && (
                                                    msg.is_pending
                                                        ? <span className="animate-pulse">...</span>
                                                        : msg.is_read
                                                            ? <FaCheckDouble size={10} className="text-rose-400" />
                                                            : <FaCheck size={10} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {previewImage && (
                            <div className="px-8 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={URL.createObjectURL(previewImage)} className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gambar dipilih...</span>
                                </div>
                                <button onClick={() => setPreviewImage(null)} className="text-rose-500"><FaTimes size={14} /></button>
                            </div>
                        )}

                        <div className="p-8 bg-slate-900/30 border-t border-slate-800/50">
                            <form onSubmit={sendMessage} className="flex gap-4">
                                <button type="button" onClick={() => fileInputRef.current.click()}
                                    className="w-14 h-14 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-700 active:scale-95">
                                    <FaPaperclip size={20} />
                                </button>
                                <input type="file" hidden ref={fileInputRef} accept="image/*"
                                    onChange={(e) => setPreviewImage(e.target.files[0])} />
                                <input type="text" value={newMessage}
                                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                                    disabled={!isConnected}
                                    placeholder={isConnected ? "Balas konsultasi..." : "Menghubungkan..."}
                                    className={`flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`} />
                                <button type="submit" disabled={(!newMessage.trim() && !previewImage) || !isConnected}
                                    className="w-14 h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95">
                                    <FaPaperPlane size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
                        <FaComments size={40} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Pilih Konsultasi</h3>
                        <p className="max-w-xs text-xs font-medium tracking-tight">Kelola klien secara real-time & profesional.</p>
                    </div>
                )}
            </div>
        </div>
    );
}