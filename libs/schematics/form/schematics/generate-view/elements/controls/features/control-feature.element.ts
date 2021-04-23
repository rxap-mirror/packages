import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import {
  HandleComponent,
  HandleComponentModule,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ControlElement } from '../control.element';
import {
  WithTemplate,
  StringOrFactory
} from '@rxap/schematics-html';

@ElementDef('control-feature')
export class ControlFeatureElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  public __tag!: string;
  public __parent!: ControlElement;

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
