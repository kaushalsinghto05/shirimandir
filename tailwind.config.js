/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctum: {
          950: '#070C18',
          900: '#0B1325',
          850: '#0F1A30',
          800: '#15223D',
          700: '#1E2F54',
          600: '#2A4072',
        },
        gold: {
          100: '#FAF4DE',
          200: '#F5DE88',
          300: '#EBCB65',
          400: '#E0BA41',
          500: '#D4AF37',
          600: '#B89223',
          700: '#947214',
        },
        terracotta: {
          50: '#FDF6F4',
          100: '#F8EBE7',
          200: '#F0D4CD',
          500: '#C85A43',
          600: '#9E4736',
          700: '#7E3426',
        },
        sandstone: {
          50: '#FDFBF7',
          100: '#F8F4EE',
          200: '#EFE8DE',
          300: '#DFD5C6',
          700: '#5C5449',
          800: '#3D372E',
          900: '#241F1A',
        },
        tulsi: {
          50: '#F0F9F5',
          100: '#E6F4ED',
          500: '#1E6B4B',
          600: '#165339',
          700: '#0F3C28',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Marcellus"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sanctum': '0 20px 40px -15px rgba(11, 19, 37, 0.12), 0 0 1px 1px rgba(212, 175, 55, 0.15)',
        'sanctum-lg': '0 25px 50px -12px rgba(11, 19, 37, 0.25), 0 0 2px 1px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'tulsi-glow': '0 0 20px -5px rgba(30, 107, 75, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
