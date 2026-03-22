export const theme = {
    colors: {
        primary: '#2C5F2D',       // Accessible Forest Green - earthy, trustworthy
        primaryLight: 'rgba(44, 95, 45, 0.15)', // Soft green for backgrounds
        secondary: '#97BC62',     // Soft leaf green
        background: '#e4ddc7ff',    // Light beige
        surface: 'rgba(255, 255, 255, 0.85)',
        surfaceHighlight: 'rgba(255, 255, 255, 0.95)',
        text: '#222222',          // Very dark gray for high contrast
        textSecondary: '#5A4E4D', // Warm brownish-gray
        success: '#27AE60',
        error: '#E74C3C',
        warning: '#F39C12',
        overlay: 'rgba(0, 0, 0, 0.5)',
        card: '#FFFFFF',
        border: '#1d1c1bff',        // Using the user's explicit preference from earlier
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        round: 999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '700',
            lineHeight: 40,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 32,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 17,
            fontWeight: '400',
            lineHeight: 26,
        },
        caption: {
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22,
        },
    },
};
