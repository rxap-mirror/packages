import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import {
  WithTemplate,
  HandleComponent,
  HandleComponentModule,
  ToValueContext
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { FormElement } from '../form.element';

@ElementDef('feature')
export class FormFeatureElement implements ParsedElement<Rule>, WithTemplate, HandleComponent, HandleComponentModule {

  public __parent!: FormElement;

  public template(): string {
    return '';
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {}

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {}

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}
