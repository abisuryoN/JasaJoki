/**
 * Utility for generating WhatsApp Redirection URLs
 */

const ADMIN_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

export const generateWhatsAppUrl = (user = null, context = {}) => {
    let message = '';

    if (context.manualMessage) {
        message = context.manualMessage;
    } else if (!user) {
        message = 'Halo admin, saya tertarik dengan jasa di website Anda. Saya ingin bertanya lebih lanjut.';
    } else {
        const serviceText = context.serviceName ? `\n* Layanan: ${context.serviceName}` : '';
        const orderText = context.orderId ? `\n* Order ID: #${context.orderId}` : '';
        
        message = `Halo admin, saya ${user.name}. Saya ingin menggunakan jasa Anda.\n\nDetail:\n* Email: ${user.email}${serviceText}${orderText}`;
    }

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${ADMIN_NUMBER}?text=${encodedMessage}`;
};

export const redirectToWhatsApp = (user = null, context = {}) => {
    window.location.href = generateWhatsAppUrl(user, context);
};
