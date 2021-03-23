import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementChildRawContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { join } from 'path';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { ComponentFeatureElement } from './component-feature.element';
import { ComponentElement } from '../component.element';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { GenerateSchema } from '../../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ComponentFeatureElement)
@ElementDef('table')
export class TableComponentFeatureElement extends ComponentFeatureElement {

  public __parent!: ComponentElement;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

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

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      () => console.log(`Execute table generator schematic for '${this.template}'`),
      externalSchematic(
        '@rxap/schematics-table',
        'generate',
        {
          project:          options.project,
          template:         this.template,
          name:             dasherize(this.name),
          path:             join(options.path?.replace(/^\//, '') ?? '', dasherize(this.__parent.name)),
          organizeImports:  false,
          fixImports:       false,
          format:           false,
          templateBasePath: options.templateBasePath,
          overwrite:        options.overwrite,
          openApiModule:    options.openApiModule
        }
      )
    ]);
  }

  public handleComponentModule({
                                 project,
                                 sourceFile,
                                 options
                               }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(
      sourceFile,
      `${classify(this.name)}TableComponentModule`,
      `./${dasherize(this.name)}-table/${dasherize(this.name)}-table.component.module`
    );
  }

}
