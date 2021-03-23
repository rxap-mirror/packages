import { NodeElement } from '../node.element';
import {
  WithTemplate,
  ToValueContext,
  AddNgModuleImport,
  NodeFactory,
  CoerceSourceFile
} from '@rxap/schematics-utilities';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementAttribute,
  ElementRequired,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { join } from 'path';
import { ComponentFeatureElement } from './features/component-feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('component')
export class ComponentElement implements WithTemplate, ParsedElement, NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  @ElementChildren(ComponentFeatureElement, { group: 'features' })
  public features: ComponentFeatureElement[] = [];

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementChildTextContent('name')
  public componentName!: string;

  @ElementChildTextContent('module')
  public componentModuleName!: string;

  @ElementChildTextContent()
  public selector!: string;

  @ElementChildTextContent()
  public from!: string;

  public createComponent = false;

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  constructor() {
    this.flexTemplateAttribute = this.flexTemplateAttribute.bind(this);
  }

  protected flexTemplateAttribute(): string {
    return `fxFlex="${this.flex}"`;
  }

  public template(): string {
    const attributes: Array<string | (() => string)> = [];
    return NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      ...attributes
    )(`\n${capitalize(this.name)}\n`);
  }

  public validate(): boolean {
    return true;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {

  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    AddNgModuleImport(sourceFile, this.componentModuleName, this.from);
  }

  public toValue({ project, options }: ToValueContext): Rule {
    const rules: Rule[]       = [];
    const componentModulePath = join(options.path ?? '', this.from + '.ts');
    if (this.createComponent) {
      rules.push(tree => {
        if (!tree.exists(componentModulePath)) {
          return chain([
              externalSchematic(
                '@rxap/schematics',
                'component-module',
                {
                  name:       dasherize(this.name),
                  path:       options.path?.replace(/^\//, ''),
                  selector: this.selector,
                  project:  options.project
                }
              )
            ]
          );
        } else {
          console.log(`The component module '${componentModulePath}' already exists!`);
        }

      });
    }
    rules.push(chain(this.features?.map(feature => feature.toValue({ project, options })) ?? []));
    rules.push(tree => {

      const componentPath = componentModulePath.replace(/\.module\./, '.');

      if (!tree.exists(componentPath)) {
        throw new Error(`Component in path '${componentPath}' does not exists`);
      }

      if (!tree.exists(componentModulePath)) {
        throw new Error(`ComponentModule in path '${componentModulePath}' does not exists`);
      }

      const componentModuleSourceFile = CoerceSourceFile(
        project,
        this.from + '.ts',
        tree.get(componentModulePath)!.content.toString('utf-8')
      );
      const componentSourceFile       = CoerceSourceFile(
        project,
        this.from.replace(/\.module$/, '') + '.ts',
        tree.get(componentPath)!.content.toString('utf-8')
      );

      return chain([
        () => this.features?.forEach(feature => feature.handleComponent({
          project,
          sourceFile: componentSourceFile,
          options
        })),
        () => this.features?.forEach(feature => feature.handleComponentModule({
          project,
          sourceFile: componentModuleSourceFile,
          options
        }))
      ]);

    });
    return chain(rules);
  }

  public postParse() {
    if (!this.componentName) {
      this.createComponent     = true;
      this.componentName       = classify(this.name);
      this.selector            = `rxap-${dasherize(this.name)}`;
      this.from                = `./${dasherize(this.name)}/${dasherize(this.name)}.component.module`;
      this.componentModuleName = `${this.componentName}ComponentModule`;
    }
    if (!this.selector) {
      this.selector = `rxap-${dasherize(this.name)}`;
    }
    if (!this.from) {
      this.from = `./${dasherize(this.name)}/${dasherize(this.name)}.component.module`;
    }
    if (!this.componentModuleName) {
      this.componentModuleName = `${this.componentName}Module`;
    }
  }

}
