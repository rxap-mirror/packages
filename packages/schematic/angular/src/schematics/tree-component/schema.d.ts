import { AngularOptions } from '../../lib/angular-options';

export interface TreeComponentOptions extends AngularOptions {
  modifiers?: string[];
  fullTree?: boolean;
}
