import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(ActionButtonElement)
@ElementDef('view-action')
export class ViewActionElement extends MethodActionElement {

  public type = 'view';

}
