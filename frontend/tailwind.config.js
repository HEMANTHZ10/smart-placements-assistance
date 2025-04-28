/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 6s ease-in-out infinite',
          'float-slow': 'float 8s ease-in-out infinite',
          'grow-pillars': 'growPillars 2s ease-out forwards',
          'draw-lines': 'drawLines 1.5s ease-in-out forwards',
          'fade-in': 'fadeIn 1s ease-out forwards',
          'particles': 'particles 10s ease-in-out infinite',
          'book-1': 'dropBook 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards',
          'book-2': 'dropBook 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards',
          'book-3': 'dropBook 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards',
          'book-4': 'dropBook 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s forwards',
          'sparkle': 'sparkle 2s ease-in-out infinite',
          'code-typing': 'typing 3s ease-in-out infinite',
        },
        keyframes: {
          pulse: {
            '0%, 100%': { opacity: 0.9, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(0.95)' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0px) rotate3d(1, 1, 1, 0deg)' },
            '50%': { transform: 'translateY(-10px) rotate3d(1, 1, 1, 2deg)' },
          },
          growPillars: {
            '0%': { transform: 'scaleY(0)', opacity: 0 },
            '100%': { transform: 'scaleY(1)', opacity: 1 },
          },
          drawLines: {
            '0%': { strokeDashoffset: '100' },
            '100%': { strokeDashoffset: '0' },
          },
          fadeIn: {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          particles: {
            '0%, 100%': { transform: 'translate(0px, 0px)' },
            '25%': { transform: 'translate(10px, -10px)' },
            '50%': { transform: 'translate(-5px, -15px)' },
            '75%': { transform: 'translate(-10px, -5px)' },
          },
          dropBook: {
            '0%': { 
              transform: 'translateY(-200px) rotate(-5deg)',
              opacity: 0
            },
            '70%': { 
              transform: 'translateY(10px) rotate(2deg)',
              opacity: 1
            },
            '100%': { 
              transform: 'translateY(0px) rotate(0deg)',
              opacity: 1
            }
          },
          sparkle: {
            '0%, 100%': { 
              opacity: 1,
              transform: 'scale(1)'
            },
            '50%': { 
              opacity: 0.3,
              transform: 'scale(0.5)'
            }
          },
          typing: {
            '0%': { transform: 'translateX(0)' },
            '20%': { transform: 'translateX(10px)' },
            '40%': { transform: 'translateX(-10px)' },
            '60%': { transform: 'translateX(5px)' },
            '80%': { transform: 'translateX(-5px)' },
            '100%': { transform: 'translateX(0)' }
          }
        },
      },
    },
    plugins: [],
  }