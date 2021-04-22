import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementRequired,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { RouteFeatureElement } from './route-feature.element';
import { ElementFactory } from '@rxap/xml-parser';
import { ComponentElement } from '../component.element';
import { join } from 'path';
import { ModuleElement } from '../module.element';
import { RoutingSchema } from '../../schema';
import {
  Rule,
  externalSchematic,
  chain
} from '@angular-devkit/schematics';
import { RouteElement } from '../route.element';
import { strings } from '@angular-devkit/core';
import { ComponentFeatureElement } from '../component-features/component-feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(RouteFeatureElement)
@ElementDef('component')
export class ComponentGenerateSchematicElement extends RouteFeatureElement {

  public __parent!: RouteElement;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildren(ComponentFeatureElement, { group: 'features' })
  public features?: ComponentFeatureElement[];

  public postValidate() {
    this.name = this.name.replace(/-?[cC]omponent$/, '');
    if (!this.__parent.component && this.name) {
      this.__parent.component = ElementFactory(ComponentElement, {
        name: classify(this.name) + 'Component',
        from: './' + join(dasherize(this.name), dasherize(this.name) + '.component')
      });
      this.__parent.module    = ElementFactory(ModuleElement, {
        name: classify(this.name) + 'ComponentModule',
        from: './' + join(dasherize(this.name), dasherize(this.name) + '.component.module')
      });
    }
  }

  public toValue({ options }: { options: RoutingSchema }): Rule {
    return tree => {

      const componentFilePath = join(options.path!, dasherize(this.name), dasherize(this.name) + '.component.ts');

      const rules: Rule[] = [];

      if (!tree.exists(componentFilePath)) {
        console.log(`component '${this.name}' does not exists in path '${componentFilePath}'`);
        const externalOptions = {
          project: options.project,
          path:    options.path,
          name:    this.name
        };
        rules.push(() => console.log('execute component module schematic', externalOptions));
        rules.push(externalSchematic(
          '@rxap/schematics',
          'component-module',
          {
            project: options.project,
            path:    options.path?.replace(/^\//, ''),
            name:    this.name
          }
        ));
      }

      console.log(this.name + ' features ' + this.features?.length);

      rules.push(...(this.features?.map(feature => feature.toValue({
        options,
        componentPath: join(options.path?.replace(/^\//, '') ?? '', dasherize(this.name))
      })) ?? []));

      return chain(rules);

    };
  }

}
