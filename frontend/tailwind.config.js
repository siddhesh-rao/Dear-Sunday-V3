export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen:   '#EDE8DF',
        parchment: '#F5F0E8',
        ink:     '#2C2018',
        sepia:   '#6B5744',
        dust:    '#9B8878',
        gold:    '#B8860B',
        rose:    '#C9987A',
        kraft:   '#C4A882',
      },
      fontFamily: {
        serif:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:   ['"DM Sans"', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
    }
  },
  plugins: []
};
