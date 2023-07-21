import { AngularOptions } from '../../lib/angular-options';
import { DialogAction } from '../../lib/dialog-action';


export interface DialogComponentOptions extends AngularOptions {
  dialogName: string;
  title?: string;
  actionList?: Array<string | DialogAction>;
}
