import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getEcho, resetEcho } from './utils/echo';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        console.error('❌ useChat must be used within a ChatProvider');
        return {
            isConnected: false,
            isConnecting: false,
            unreadCounts: {},
            onlineUserIds: [],
            isUserOnline: () => false,
            processedMessageIds: { current: new Set() }
        };
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useNotification();
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    const bc = useRef(new BroadcastChannel('chat_sync'));
    const processedMessageIds = useRef(new Set());

    // ✅ 1. CONNECTION MONITORING
    useEffect(() => {
        if (!user) return;

        const echo = getEcho();

        const handleConnected = () => {
            console.log('✅ WebSocket Connected');
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionError(null);
            window.dispatchEvent(new Event('ws:reconnected'));
            bc.current.postMessage({ type: 'WS_CONNECTED' });
        };
        const handleDisconnected = () => {
            console.log('❌ WebSocket Disconnected');
            setIsConnected(false);
            setIsConnecting(false);
            bc.current.postMessage({ type: 'WS_DISCONNECTED' });
        };
        const handleConnecting = () => {
            console.log('⏳ WebSocket Connecting...');
            setIsConnecting(true);
        };
        const handleUnavailable = () => {
            console.log('⚠️ WebSocket Unavailable');
            setIsConnected(false);
            setIsConnecting(false);
        };
        const handleError = (err) => {
            console.error('WS ERROR:', err);
            setConnectionError(err);
        };

        const connection = echo.connector?.pusher?.connection;
        if (connection) {
            connection.bind('connected', handleConnected);
            connection.bind('disconnected', handleDisconnected);
            connection.bind('connecting', handleConnecting);
            connection.bind('unavailable', handleUnavailable);
            connection.bind('error', handleError);

            setIsConnected(connection.state === 'connected');
            setIsConnecting(connection.state === 'connecting');
        }

        return () => {
            if (connection) {
                connection.unbind('connected', handleConnected);
                connection.unbind('disconnected', handleDisconnected);
                connection.unbind('connecting', handleConnecting);
                connection.unbind('unavailable', handleUnavailable);
                connection.unbind('error', handleError);
            }
        };
    }, [user?.id]);

    // ✅ 1.1 MULTI-TAB SYNC
    useEffect(() => {
        const handleSync = (e) => {
            if (e.data.type === 'WS_CONNECTED') setIsConnected(true);
            if (e.data.type === 'WS_DISCONNECTED') setIsConnected(false);
        };
        bc.current.onmessage = handleSync;
        return () => { bc.current.onmessage = null; };
    }, []);

    const playNotificationSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    // ✅ 2. GLOBAL LISTENERS
    useEffect(() => {
        if (!user) {
            resetEcho();
            setIsConnected(false);
            setOnlineUserIds([]);
            return;
        }

        const echo = getEcho();

        console.log('🔗 Global Presence Join');
        echo.join('chat.presence')
            .here((users) => setOnlineUserIds(users.map(u => u.id)))
            .joining((u) => setOnlineUserIds(prev => [...new Set([...prev, u.id])]))
            .leaving((u) => setOnlineUserIds(prev => prev.filter(id => id !== u.id)));

        if (user.role === 'admin') {
            console.log('🔗 Global Admin Notifications Subscribe');
            echo.private('admin.notifications')
                .listen('MessageSent', (e) => {
                    console.log('🔥 New chat activity:', e);
                    playNotificationSound();
                    showToast(`Pesan baru dari ${e.message.sender_name || 'Klien'}`, 'info');
                    setUnreadCounts(prev => ({
                        ...prev,
                        [e.message.chat_room_id]: (prev[e.message.chat_room_id] || 0) + 1
                    }));
                });

            return () => {
                console.log('🚫 Global Unsubscribe Admin & Presence');
                echo.leave('chat.presence');
                echo.leave('admin.notifications');
            };
        }

        return () => {
            console.log('🚫 Global Unsubscribe Presence');
            echo.leave('chat.presence');
        };
    }, [user?.id]);

    const isUserOnline = (userId) => onlineUserIds.includes(userId);

    return (
        <ChatContext.Provider value={{
            onlineUserIds,
            isUserOnline,
            unreadCounts,
            setUnreadCounts,
            isConnected,
            isConnecting,
            connectionError,
            processedMessageIds,
            playNotificationSound
        }}>
            {children}
        </ChatContext.Provider>
    );
};