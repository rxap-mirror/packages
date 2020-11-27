import { ControlFeatureElement } from './control-feature.element';
import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { join } from 'path';
import { ControlElement } from '../control.element';
import { strings } from '@angular-devkit/core';
import { ToValueContext } from '@rxap-schematics/utilities';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { GenerateSchema } from '../../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ControlFeatureElement)
@ElementDef('form')
export class FormElement extends ControlFeatureElement {

  public __parent!: ControlElement;

  @ElementChildTextContent()
  public templateValue!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  public postParse() {
    if (!this.templateValue && this.name) {
      this.templateValue = join('views', 'forms', dasherize(this.name) + '.xml');
    }
  }

  public validate(): boolean {
    return !!this.templateValue;
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      () => console.log(`Execute form component generator schematic for '${this.templateValue}'`),
      externalSchematic(
        '@rxap-material/form-system',
        'generate',
        {
          project:         options.project,
          template:        this.templateValue,
          name:            this.name,
          organizeImports: false,
          fixImports:      false,
          format:          false,
          overwrite:       options.overwrite,
          openApiModule:   options.openApiModule,
          path:            join(options.path?.replace(/^\//, '') ?? '', dasherize(this.__parent.name) + '-control')
        }
      )
    ]);
  }

}
