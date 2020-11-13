import { ControlElement } from './control.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('component-control')
export class ComponentControlElement extends ControlElement {

  @ElementChildTextContent('name')
  @ElementRequired()
  public componentName!: string;

  @ElementChildTextContent('module')
  public componentModuleName?: string;

  @ElementChildTextContent()
  @ElementRequired()
  public selector!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public from!: string;

  public template(): string {
    return NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      `formControlName="${this.name}"`,
      `i18n="@@forms.${this.controlPath}.label"`
    )(`\n${capitalize(this.name)}\n`);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.componentModuleName ?? `${this.componentName}Module`, this.from);
  }

}
