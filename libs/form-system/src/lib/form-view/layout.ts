import { Control } from './control';
import { Stepper } from './stepper';

export class Layout {

  public components: Array<Layout | Control | Stepper> = [];
  public orientation: 'row' | 'column'       = 'row';
  public gap: string                         = '0';
  public align: string                       = '';

}
