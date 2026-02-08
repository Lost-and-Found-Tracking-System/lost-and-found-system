/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'marquee': 'marquee 25s linear infinite',
                'float': 'float 8s ease-in-out infinite',
                'float-slow': 'float 12s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 6s ease infinite',
                'shimmer': 'shimmer 2.5s ease-in-out infinite',
                'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
                    '33%': { transform: 'translateY(-20px) translateX(10px) scale(1.05)' },
                    '66%': { transform: 'translateY(10px) translateX(-10px) scale(0.98)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.4', filter: 'blur(80px)' },
                    '50%': { opacity: '0.7', filter: 'blur(100px)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'grid-pulse': {
                    '0%, 100%': { opacity: '0.03' },
                    '50%': { opacity: '0.08' },
                },
            },
            backgroundSize: {
                '200': '200% 200%',
            },
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
        },
    },
    plugins: [],
}
