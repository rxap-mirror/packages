const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { RXAP_TAILWIND_CONFIG } = require('../../../../dist/packages/browser/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      'src/**/!(*.stories|*.spec).{ts,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [ RXAP_TAILWIND_CONFIG ],
};
