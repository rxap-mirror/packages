import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementChildRawContent,
} from '@rxap/xml-parser/decorators';
import { ComponentFeatureElement } from './component-feature.element';
import { join } from 'path';
import { RoutingSchema } from '../../schema';
import { Rule, chain, externalSchematic } from '@angular-devkit/schematics';
import { ComponentGenerateSchematicElement } from '../route-features/component-generate-schematic.element';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ComponentFeatureElement)
@ElementDef('table')
export class TableComponentFeatureElement extends ComponentFeatureElement {
  public __parent!: ComponentGenerateSchematicElement;

  @ElementChildTextContent()
  public name?: string;

  @ElementChildRawContent()
  public template?: string;

  public postParse() {
    if (!this.template && this.name) {
      this.template = join('views', 'tables', dasherize(this.name) + '.xml');
      console.log('set template path to: ' + this.template);
    }
  }

  public validate(): boolean {
    return !!this.template;
  }

  public toValue({
    options,
    componentPath,
  }: {
    options: RoutingSchema;
    componentPath: string;
  }): Rule {
    return chain([
      () =>
        console.log(`Execute table generator schematic for '${this.template}'`),
      externalSchematic('@rxap/schematics-table', 'generate', {
        project: options.project,
        template: this.template,
        name: this.name,
        path: componentPath,
        templateBasePath: options.templateBasePath,
        organizeImports: false,
        fixImports: false,
        format: false,
        overwrite: options.overwrite,
        openApiModule: options.openApiModule,
        skipTsFiles: options.skipTsFiles,
      }),
    ]);
  }
}
