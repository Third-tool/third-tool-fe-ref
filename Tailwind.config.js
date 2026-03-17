/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                success: {
                    DEFAULT: '#10b981',
                    light: '#ecfdf5',
                    lighter: '#d1fae5',
                },
                danger: '#ef4444',
                warning: {
                    DEFAULT: '#f59e0b',
                    light: '#fffbeb',
                },
            },
            scale: {
                '102': '1.02',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'ready-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                    '50%': { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
                },
                'green-light': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.7', transform: 'scale(1.2)' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s linear infinite',
                'ready-pulse': 'ready-pulse 2s ease-in-out infinite',
                'green-light': 'green-light 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}