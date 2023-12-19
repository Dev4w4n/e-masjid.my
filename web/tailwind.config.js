module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "410px",
      },
      backgroundImage: {
        homefrontbg: "url(./assets/home/mjsr-front.png)",
        "quiz-bg": "url(./assets/home/quiz_bg.png)",
      },
      colors: {
        "button-primary": "#D9CAB3",
        "button-primary-hover": "#B9CAB8",
      },
    },
  },
  plugins: [],
};
