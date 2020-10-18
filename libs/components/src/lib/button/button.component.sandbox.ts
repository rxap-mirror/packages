import { sandboxOf } from 'angular-playground';
import { ButtonComponent } from './button2.component';

export default sandboxOf(ButtonComponent)
  .add('default', {
    template: `<button [definition]="definition" (click)="log('click')" rxap-button></button>`,
    context:  {
      definition: {
        icon: {
          svgIcon: 'delete'
        }
      },
      log:        console.log
    }
  });
