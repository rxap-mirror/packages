import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import { ComponentFeatureElement } from './component-feature.element';
import { join } from 'path';
import { RoutingSchema } from '../../schema';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { ComponentGenerateSchematicElement } from '../route-features/component-generate-schematic.element';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ComponentFeatureElement)
@ElementDef('form')
export class FormComponentFeatureElement extends ComponentFeatureElement {

  public __parent!: ComponentGenerateSchematicElement;

  @ElementChildTextContent()
  public template!: string;

  @ElementChildTextContent()
  public name?: string;

  public postParse() {
    if (!this.template && this.name) {
      this.template = join('views', 'forms', dasherize(this.name) + '.xml');
    }
  }

  public validate(): boolean {
    return !!this.template;
  }

  public toValue({ options, componentPath }: { options: RoutingSchema, componentPath: string }): Rule {
    return chain([
      () => console.log(`Execute form component generator schematic for '${this.template}'`),
      externalSchematic(
        '@rxap/material-form-system',
        'generate',
        {
          project:         options.project,
          template:        this.template,
          name:            this.name,
          path:            componentPath,
          organizeImports: false,
          fixImports:      false,
          format:          false,
          overwrite:       options.overwrite,
          openApiModule:   options.openApiModule
        }
      )
    ]);
  }
}
