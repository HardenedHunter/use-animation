/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        battle: "1.25fr 0.5fr 1.25fr",
      },
    },
  },
  plugins: [],
};
