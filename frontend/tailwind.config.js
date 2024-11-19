module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  prefix: 'tw-',
  plugins: [
    require('flowbite/plugin')
  ],
}