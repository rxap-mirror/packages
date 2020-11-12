import {
  addDecorator,
  moduleMetadata
} from '@storybook/angular';
import { FormControlsComponentModule } from './form-controls.component.module';
import { FormControlsComponent } from './form-controls.component';
import { FormDirective } from '@rxap/forms';

addDecorator(moduleMetadata({
  imports:   [
    FormControlsComponentModule
  ],
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
