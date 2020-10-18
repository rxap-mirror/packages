import { addParameters } from '@storybook/angular';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withA11y } from '@storybook/addon-a11y';
// import '@storybook/addon-console';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import documentationJson from '../documentation.json';

setCompodocJson(documentationJson);

addParameters({
  withA11y,
  viewport: {
    viewports: INITIAL_VIEWPORTS
  },
  backgrounds: [
    { name: 'light', value: '#fafafa', default: true },
    { name: 'dark', value: '#303030' }
  ]
});
