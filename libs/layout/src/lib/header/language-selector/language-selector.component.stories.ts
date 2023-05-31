import {
  moduleMetadata,
  addDecorator
} from '@storybook/angular';

import { LanguageSelectorComponent } from './language-selector.component';

addDecorator(moduleMetadata({
  imports: []
}));

export default {
  title:     'LanguageSelectorComponent',
  component: LanguageSelectorComponent
};

export const basic = () => ({
  component: LanguageSelectorComponent,
  props:     {}
});
