const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  darkMode: "class", // enable class-based dark mode
  theme: {
    extend: {},
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
