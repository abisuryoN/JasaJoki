import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
    if (echoInstance) return echoInstance;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT),
        forceTLS: false,
        enabledTransports: ['ws'],
        authorizer: (channel) => ({
            authorize: (socketId, callback) => {
                // Ambil token langsung dari localStorage
                const token = localStorage.getItem(
                    import.meta.env.VITE_AUTH_TOKEN_KEY || 'token'
                );

                axios.post(
                    `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
                    {
                        socket_id: socketId,
                        channel_name: channel.name,
                    },
                    {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    }
                )
                    .then(res => callback(false, res.data))
                    .catch(err => callback(true, err));
            },
        }),
    });

    return echoInstance;
}

export function resetEcho() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}