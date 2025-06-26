// tailwind.config.js
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                luxury: {
                    DEFAULT: '#0a0a0a',     // Deep black
                    soft: '#1a1a1a',        // Soft dark
                    silver: '#c0c0c0',      // Accents
                    gold: '#d4af37',        // Optional luxury pop
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    }

};
