import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Komponen Image khusus untuk memuat gambar dari URL backend yang terproteksi (Auth:API)
 * Menggunakan Axios untuk fetch Blob agar token Authorization ikut terkirim.
 */
const SecureImage = ({ src, alt, className, fallback = '/images/placeholder.svg', ...props }) => {
    const [imageSrc, setImageSrc] = useState(fallback);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let objectUrl = null;

        const loadImage = async () => {
            if (!src) {
                setImageSrc(fallback);
                setLoading(false);
                return;
            }

            // Jika rute relatif (tapi bukan di /images/) atau mengandung /api/, anggap sebagai API terproteksi
            const isApiRoute = src.startsWith('/') && !src.startsWith('/images/') || src.includes('/api/');
            
            if (!isApiRoute) {
                setImageSrc(src);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await api.get(src, { responseType: 'blob' });
                objectUrl = URL.createObjectURL(response.data);
                setImageSrc(objectUrl);
            } catch (err) {
                console.error('Failed to load secure image:', err);
                setImageSrc(fallback);
            } finally {
                setLoading(false);
            }
        };

        loadImage();

        // Cleanup: Revoke object URL saat unmount atau src berubah
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src, fallback]);

    return (
        <div className={`relative overflow-hidden ${loading ? 'animate-pulse bg-slate-800' : ''}`}>
            <img 
                src={imageSrc} 
                alt={alt} 
                className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                {...props} 
            />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default SecureImage;
