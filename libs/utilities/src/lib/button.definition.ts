import { Subject } from 'rxjs';
import {
  FunctionOrConstant,
  Action,
  IconConfig,
  ThemePalette
} from './helpers';

export enum ButtonTypes {
  Default = 'default',
  Raised  = 'raised',
  Flat    = 'flat',
  Stroked = 'stroked',
  Icon    = 'icon',
  Fab     = 'fab',
  MiniFab = 'mini-fab'
}

export interface ButtonDefinition<P extends any[] = any, A = Action> {
  name: string;
  color?: FunctionOrConstant<string | null, P>;
  disabled?: FunctionOrConstant<boolean, P>;
  icon?: FunctionOrConstant<IconConfig, P>;
  label?: FunctionOrConstant<string, P>;
  theme?: FunctionOrConstant<ThemePalette, P>;
  tooltip?: FunctionOrConstant<string, P>;
  tooltipDisabled?: FunctionOrConstant<boolean, P>;
  confirm?: FunctionOrConstant<boolean, P>;
  hide?: FunctionOrConstant<boolean, P>;
  show?: FunctionOrConstant<boolean, P>;
  type: ButtonTypes;
  action?: FunctionOrConstant<A, P>;
  click$?: Subject<null | A>;
}
