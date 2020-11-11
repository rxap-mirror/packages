import { ControlElement } from './control.element';
import {
  ElementChild,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import {
  PrefixElement,
  SuffixElement
} from './prefix.element';
import { ErrorsElement } from './errors.element';
import { NodeElement } from '../node.element';
import { strings } from '@angular-devkit/core';
import { NodeFactory } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

export abstract class FormFieldElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  @ElementChild(PrefixElement)
  public prefix?: PrefixElement;

  @ElementChild(SuffixElement)
  public suffix?: SuffixElement;

  @ElementChildTextContent()
  public hint?: string;

  @ElementChild(ErrorsElement)
  public errors?: ErrorsElement;

  public template(...attributes: Array<string | (() => string)>): string {
    const nodes: Array<NodeElement | string> = [
      NodeFactory('mat-label')(this.label ?? capitalize(this.name)),
      this.innerTemplate()
    ];
    if (this.suffix) {
      nodes.push(this.suffix?.template());
    }
    if (this.prefix) {
      nodes.push(this.prefix?.template());
    }
    if (this.hint) {
      nodes.push(NodeFactory('mat-hint')(this.hint));
    }
    if (this.errors) {
      nodes.push(this.errors.template());
    }
    return NodeFactory('mat-form-field', this.flexTemplateAttribute, ...attributes)(nodes);
  }

  protected abstract innerTemplate(): string;

}
