import {
  ElementAttribute,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
  ParsedElement,
} from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { CoerceImports } from '@rxap/schematics-ts-morph';

@ElementDef('type')
export class TypeElement implements ParsedElement {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public from?: string;

  @ElementAttribute()
  public nullable?: boolean;

  public get type(): string {
    if (this.nullable) {
      return [this.name, 'null'].join(' | ');
    }
    return this.name;
  }

  public toValue({sourceFile}: { sourceFile: SourceFile }): string {
    if (this.from) {
      CoerceImports(sourceFile, {
        namedImports: [this.name],
        moduleSpecifier: this.from,
      });
    }
    return this.type;
  }

}

@ElementExtends(TypeElement)
@ElementDef('string-type')
export class StringTypeElement extends TypeElement implements ParsedElement {

  public override name = 'string';

}
