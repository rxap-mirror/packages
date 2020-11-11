import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(ActionButtonElement)
@ElementDef('archive-action')
export class ArchiveActionElement extends MethodActionElement {

  public type = 'archive';

}
