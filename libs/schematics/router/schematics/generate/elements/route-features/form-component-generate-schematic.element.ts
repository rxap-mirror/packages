import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementRequired,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { RouteFeatureElement } from './route-feature.element';
import { join } from 'path';
import { ElementFactory } from '@rxap/xml-parser';
import { ComponentElement } from '../component.element';
import { ModuleElement } from '../module.element';
import { RoutingSchema } from '../../schema';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { RouteElement } from '../route.element';
import { strings } from '@angular-devkit/core';
import { ComponentFeatureElement } from '../component-features/component-feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(RouteFeatureElement)
@ElementDef('form')
export class FormComponentGenerateSchematicElement extends RouteFeatureElement {

  public __parent!: RouteElement;

  @ElementChildTextContent()
  public template!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildren(ComponentFeatureElement, { group: 'features' })
  public features?: ComponentFeatureElement[];

  public postParse() {
    if (!this.template && this.name) {
      this.template = join('views', 'forms', dasherize(this.name) + '.xml');
    }
  }

  public postValidate() {
    if (!this.__parent.component && this.name) {
      this.__parent.component = ElementFactory(ComponentElement, {
        name: classify(this.name) + 'FormComponent',
        from: './' + join(dasherize(this.name) + '-form', dasherize(this.name) + '-form.component')
      });
      this.__parent.module    = ElementFactory(ModuleElement, {
        name: classify(this.name) + 'FormComponentModule',
        from: './' + join(dasherize(this.name) + '-form', dasherize(this.name) + '-form.component.module')
      });
    }
  }

  public validate(): boolean {
    return !!this.template;
  }

  public toValue({ options }: { options: RoutingSchema }): Rule {
    return chain([
      () => console.log(`Execute form component generator schematic for '${this.template}'`),
      externalSchematic(
        '@rxap/material-form-system',
        'generate',
        {
          project:         options.project,
          template:        this.template,
          name:            this.name,
          organizeImports: false,
          fixImports:      false,
          format:          false,
          overwrite:       options.overwrite,
          openApiModule:   options.openApiModule
        }
      ),
      ...(this.features?.map(feature => feature.toValue({
        options,
        componentPath: join(options.path?.replace(/^\//, '') ?? '', dasherize(this.name) + '-form')
      })) ?? [])
    ]);
  }

}
