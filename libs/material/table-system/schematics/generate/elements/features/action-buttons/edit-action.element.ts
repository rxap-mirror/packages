import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(ActionButtonElement)
@ElementDef('edit-action')
export class EditActionElement extends MethodActionElement {

  public type = 'edit';

}
