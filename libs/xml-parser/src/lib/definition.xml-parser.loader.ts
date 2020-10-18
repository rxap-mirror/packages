import {
  Injectable,
  InjectionToken,
  Inject,
  Injector
} from '@angular/core';
import { XmlParserService } from './xml-parser.service';
import { XmlFileLoader } from './xml-file.loader';
import { BaseDefinitionElement } from './elements/definition.element';
import { Subject } from 'rxjs';
import {
  BaseDefinitionMetadata,
  BaseDefinition
} from '@rxap/definition';

export type TemplateId = string;

export const XML_PARSER_BASE_URL = new InjectionToken('rxap-xml-parser-base-url');

@Injectable()
export abstract class DefinitionXmlParserLoader<Definition extends BaseDefinition<Metadata>,
  DefinitionElement extends BaseDefinitionElement,
  Metadata extends BaseDefinitionMetadata,
  > {

  public readonly templates        = new Map<TemplateId, string>();
  public readonly parsedTemplates  = new Map<TemplateId, DefinitionElement>();
  public loaded$                   = new Subject<TemplateId>();
  private readonly templateLoading = new Map<TemplateId, Promise<DefinitionElement | null>>();

  constructor(
    public readonly xmlFileLoader: XmlFileLoader,
    public readonly xmlParser: XmlParserService,
    @Inject(XML_PARSER_BASE_URL) public readonly baseUrl: string
  ) {}

  public loadTemplate$(definitionId: string): Promise<DefinitionElement | null> {

    if (this.parsedTemplates.has(definitionId)) {
      return Promise.resolve(this.parsedTemplates.get(definitionId)!);
    }
    if (this.templateLoading.has(definitionId)) {
      return this.templateLoading.get(definitionId)!;
    }

    const load$ = this._loadTemplate$(definitionId).then(element => {
      this.templateLoading.delete(definitionId);
      return element;
    });

    this.templateLoading.set(definitionId, load$);

    return load$;
  }

  public loadTemplateFromString<T extends Definition>(template: string, templateId: string): DefinitionElement | null {
    return this.xmlParser.parseFromXml<DefinitionElement>(template, templateId);
  }

  public async load$(definitionId: string, metadata: Partial<Metadata> = {}, injector?: Injector): Promise<Definition | null> {

    const parsedTemplate = await this.loadTemplate$(definitionId);

    if (!parsedTemplate) {
      return null;
    }

    return this.build(parsedTemplate, metadata, injector);
  }

  public load(definitionId: string, metadata: Partial<Metadata> = {}, injector?: Injector): Definition | null {
    throw new Error('Not implemented!');
  }

  private async _loadTemplate$(definitionId: string): Promise<DefinitionElement | null> {
    let template = this.templates.get(definitionId);

    if (!template) {
      template = await this.xmlFileLoader.getXmlFile$(`${this.baseUrl}${definitionId}.xml`);
    }

    if (!template) {
      return null;
    }

    this.templates.set(definitionId, template);

    const parsedTemplate = this.xmlParser.parseFromXml<DefinitionElement>(template, definitionId);

    this.parsedTemplates.set(definitionId, parsedTemplate);

    this.loaded$.next(definitionId);

    return parsedTemplate;
  }

  public abstract build<T extends Definition>(definitionElement: BaseDefinitionElement, metadata?: Partial<Metadata>, injector?: Injector): T;

}
