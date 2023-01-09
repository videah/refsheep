/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./templates/**/*.html",
        "./themes/**/*.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    // darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: '1rem'
        },
        extend: {
            screens: {
                'more-lg': '1048px',
            },
            transitionProperty: {
                'height': 'height'
            }
        },
    },
    variants: {},
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwind-children'),
        require('tailwindcss-animate'),
        require('@shrutibalasa/tailwind-grid-auto-fit'),
    ],
};