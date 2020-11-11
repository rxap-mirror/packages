import {
  ElementParser,
  ParsedElement,
  RxapElement,
  XmlParserService
} from '@rxap/xml-parser';
import { strings } from '@angular-devkit/core';
import { NodeFactory } from '@rxap-schematics/utilities';

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
export class ErrorsElement implements ParsedElement {

  public errors: Record<string, string> = {};

  public validate(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  public template(): string {
    let template = '';
    for (const [ error, message ] of Object.entries(this.errors)) {
      template += NodeFactory('mat-error', `*rxapControlError="let error key '${error}'"`)(message);
    }
    return template;
  }

}
