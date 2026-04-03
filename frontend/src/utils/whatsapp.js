/**
 * Utility for generating WhatsApp Redirection URLs
 * Admin numbers: 085719630624, 085281156074
 */

const ADMIN_NUMBERS = [
    '6285719630624',
    '6285281156074',
];

// Default: use first admin number for user-facing links
const PRIMARY_ADMIN = ADMIN_NUMBERS[0];

export const generateWhatsAppUrl = (user = null, context = {}) => {
    const targetNumber = context.adminNumber || PRIMARY_ADMIN;
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
    return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
};

export const redirectToWhatsApp = (user = null, context = {}) => {
    window.location.href = generateWhatsAppUrl(user, context);
};

/**
 * Get all admin WhatsApp numbers.
 */
export const getAdminNumbers = () => ADMIN_NUMBERS;

/**
 * Generate URLs for all admin numbers (useful for showing multiple WA buttons).
 */
export const generateAllAdminUrls = (user = null, context = {}) => {
    return ADMIN_NUMBERS.map((number, index) => ({
        number,
        label: `Admin ${index + 1}`,
        url: generateWhatsAppUrl(user, { ...context, adminNumber: number }),
    }));
};
