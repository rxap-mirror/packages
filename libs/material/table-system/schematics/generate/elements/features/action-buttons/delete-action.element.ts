import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(ActionButtonElement)
@ElementDef('delete-action')
export class DeleteActionElement extends MethodActionElement {

  public type = 'delete';

}
