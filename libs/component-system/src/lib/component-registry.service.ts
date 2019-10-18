import {
  Injectable,
  Type
} from '@angular/core';
import { ComponentMetaDataKeys } from './metadata-keys';
import { getMetadata } from '@rxap/utilities';

@Injectable({ providedIn: 'root' })
export class ComponentRegistryService {

  public components = new Map<string, Type<any>>();

  public register(component: Type<any>): void {

    const componentId = getMetadata<string>(ComponentMetaDataKeys.COMPONENT_ID, component);

    if (!componentId) {
      throw new Error(`[ComponentRegistryService::add] component has not a defined id`);
    }

    this.components.set(componentId, component);

  }

  public get<T>(id: string): Type<any> {
    if (!this.components.has(id)) {
      throw new Error(`[ComponentRegistryService::getDefinition] Component definition with id '${id}' is not registered`);
    }
    return this.components.get(id);
  }

}
