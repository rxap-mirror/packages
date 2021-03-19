import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import {
  HandleComponent,
  HandleComponentModule,
  WithTemplate,
  ToValueContext,
  StringOrFactory
} from '@rxap/schematics-utilities';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ArrayElement } from '../array.element';

@ElementDef('array-feature')
export class ArrayFeatureElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  public __tag!: string;
  public __parent!: ArrayElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  public template(...attributes: StringOrFactory[]): string {
    return '';
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}
