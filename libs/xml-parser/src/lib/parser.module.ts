import { XmlParserService } from './xml-parser.service';
import { Type } from '@rxap/utilities';
import { ParsedElement } from './elements/parsed-element';

export abstract class RootParserModule {

  protected constructor(
    public readonly xmlParser: XmlParserService,
    public readonly parsedElements: any[]
  ) {
    this.parsedElements.forEach(pe => this.register(pe));
  }

  public register(parsedElement: Type<ParsedElement>) {
    this.xmlParser.register(parsedElement);
  }

}

export abstract class RegisterParserModule {

  protected constructor(
    public readonly root: RootParserModule,
    public readonly parsedElements: any[][]
  ) {
    this.parsedElements.forEach(pe => pe.forEach(p => this.root.register(p)));
  }

}
