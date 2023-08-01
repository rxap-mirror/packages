const {createGlobPatternsForDependencies} = require('@nx/angular/tailwind');
const {join} = require('path');
const { RXAP_TAILWIND_CONFIG } = require('../../dist/packages/browser/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  presets: [ RXAP_TAILWIND_CONFIG ],
};
