import {
  addDecorator,
  moduleMetadata
} from '@storybook/angular';

import { FormControlsComponent } from './form-controls.component';
import { FormDirective } from '@rxap/forms';

addDecorator(moduleMetadata({
  imports:   [],
  providers: [
    {
      provide:  FormDirective,
      useValue: {}
    }
  ]
}));

export default {
  title:     'FormControlsComponent',
  component: FormControlsComponent
};

export const basic = () => ({
  component: FormControlsComponent,
  props:     {}
});

export const allowResubmit = () => ({
  component: FormControlsComponent,
  props:     {
    allowResubmit: true
  }
});
