import { RouteFeatureElement } from './route-feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { ComponentElement } from '../component.element';

@ElementExtends(RouteFeatureElement)
@ElementDef('empty-router-outlet')
export class EmptyRouterOutletElement extends RouteFeatureElement {

  public postValidate() {
    this.__parent.component = ElementFactory(ComponentElement, {
      name: 'EmptyRouterOutletComponent',
      from: '@rxap/components'
    });
  }

}
