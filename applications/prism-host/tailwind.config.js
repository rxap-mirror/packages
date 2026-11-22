const { join } = require('path');

/**
 * The styleguide renders the components of all libraries, so tailwind has to scan the sources of all libraries.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    join(__dirname, 'src/**/*.{ts,html}'),
    join(
      __dirname,
      '../../packages/**/src/**/!(*.stories|*.spec|*.cy).{ts,html}',
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
