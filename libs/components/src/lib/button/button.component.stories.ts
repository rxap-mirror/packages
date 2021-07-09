import {
  moduleMetadata,
  storiesOf
} from '@storybook/angular';
import { ButtonComponentModule } from './button.component.module';
import { ButtonTypes } from '@rxap/utilities/rxjs';

storiesOf('Button', module)
  .addDecorator(
    moduleMetadata({
      imports: [
        ButtonComponentModule,
      ]
    })
  )
  .add('Icon', () => ({
    props:    {
      definition: {
        name: 'icon-button',
        icon: {
          icon: 'pencil'
        },
        type: ButtonTypes.Icon
      }
    },
    template: '<button [rxap-button]="definition"></button>'
  }))
  .add('Raised', () => ({
    props:    {
      definition: {
        name:  'raised-button',
        label: 'Raised',
        type:  ButtonTypes.Raised
      }
    },
    template: '<button [rxap-button]="definition"></button>'
  }));
