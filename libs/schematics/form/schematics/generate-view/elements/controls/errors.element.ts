import {
  ElementParser,
  ParsedElement,
  RxapElement,
  XmlParserService
} from '@rxap/xml-parser';
import { strings } from '@angular-devkit/core';
import {
  HandleComponent,
  HandleComponentModule,
  ToValueContext,
  AddNgModuleImport,
} from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import {
  NodeFactory,
  WithTemplate
} from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

export function ErrorsElementParser(
  parser: XmlParserService,
  element: RxapElement,
  errorsElement: ErrorsElement = new ErrorsElement()
): ErrorsElement {

  for (const child of element.getAllChildNodes()) {
    errorsElement.errors[ camelize(child.name) ] = child.getTextContent();
  }

  return errorsElement;
}

@ElementParser('errors', ErrorsElementParser)
export class ErrorsElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  public errors: Record<string, string> = {};

  public validate(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  public template(): string {
    let template = '';
    for (const [ error, message ] of Object.entries(this.errors)) {
      template += NodeFactory('mat-error', `*rxapControlError="let error key '${error}'"`, `data-cy="error.${error}"`)(message);
    }
    return template;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'ControlErrorDirectiveModule', '@rxap/material-form-system');
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}

