module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontSize: {
                '2xs': '.6rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
