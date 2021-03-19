import { NodeElement } from '../node.element';
import {
  ElementAttribute,
  ElementDef,
  ElementExtends,
  ElementRequired,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  WithTemplate,
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { ArrayFeatureElement } from './features/array-feature.element';

@ElementExtends(NodeElement)
@ElementDef('array')
export class ArrayElement implements WithTemplate, ParsedElement, NodeElement {

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementChildren(ArrayFeatureElement, { group: 'features' })
  public features?: ArrayFeatureElement[];

  public attributes: Array<string | (() => string)> = [];

  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return [ this.__parent.controlPath, this.name ].join('.');
  }

  constructor() {
    this.flexTemplateAttribute = this.flexTemplateAttribute.bind(this);
  }

  public hasFeature(tag: string) {
    return !!this.features?.find(feature => feature.__tag === tag);
  }

  public getFeature<T extends ArrayFeatureElement>(tag: string): T {
    const featureElement = this.features?.find(feature => feature.__tag === tag);
    if (!featureElement) {
      throw new Error(`Could not find feature '${tag}' for the array control '${this.controlPath}'!`);
    }
    return featureElement as any;
  }

  protected flexTemplateAttribute(): string {
    return `fxFlex="${this.flex}"`;
  }

  public template(): string {
    return `
<!-- control ${this.name} -->
`;
  }

  public validate(): boolean {
    return true;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.features?.forEach(feature => feature.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    this.features?.forEach(feature => feature.handleComponentModule({ project, sourceFile, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.features?.map(feature => feature.toValue({ project, options })) ?? []);
  }

}
