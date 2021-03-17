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

  public toValue({ project, options }: ToValueContext<{ path: string, project: string, overwrite: boolean, openApiModule: string }>): Rule {
    return chain([
      () => console.log(`Execute table generator schematic for '${this.template}'`),
      externalSchematic(
        '@rxap/schematics-table',
        'generate',
        {
          project:         options.project,
          template:        this.template,
          name:            dasherize(this.name) + '-table',
          path:            join(options.path, dasherize(this.__parent.name)).replace(/^\//, ''),
          organizeImports: false,
          fixImports:      false,
          format:          false,
          overwrite:       options.overwrite,
          openApiModule:   options.openApiModule
        }
      )
    ]);
  }

  public handleComponentModule({
                                 project,
                                 formSourceFile,
                                 componentSourceFile,
                                 options
                               }: ToValueContext & { formSourceFile: SourceFile, componentSourceFile: SourceFile }) {
    super.handleComponentModule({ project, formSourceFile, componentSourceFile, options });
    AddNgModuleImport(
      componentSourceFile,
      `${classify(this.name)}TableComponentModule`,
      `./${dasherize(this.name)}-table/${dasherize(this.name)}-table.component.module`
    );
  }

}
