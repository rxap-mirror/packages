import {
  ParsedElement,
  RxapElement,
  XmlParserService
} from '@rxap/xml-parser';
import {
  ControlOptions,
  ControlOption,
  ToDisplayFunction,
  KeyValue
} from '@rxap/utilities';
import { compile } from 'handlebars';
import {
  ParseElementWithDataSource,
  ParsedElementWithDataSource,
  DataSourceElement,
  DataSourceIdWithViewer
} from './data-source.element';
import {
  ElementDef,
  ElementChildren,
  ElementTextContent,
  ElementChild,
  ElementAttribute,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  BaseDataSource,
  StaticDataSource
} from '@rxap/data-source';

/**
 * @deprecated
 * @param parser
 * @param element
 * @param optionElement
 */
export function ParseOptionElement(
  parser: XmlParserService,
  element: RxapElement,
  optionElement: OptionElement = new OptionElement()
): OptionElement {

  optionElement.display = element.getTextContent(optionElement.display);
  optionElement.value   = element.get('value', optionElement.value || optionElement.display);

  return optionElement;
}

@ElementDef('option')
export class OptionElement implements ParsedElement<ControlOption> {

  @ElementAttribute()
  public value?: any;

  @ElementTextContent()
  @ElementRequired()
  public display!: string;

  @ElementAttribute()
  public i18n?: boolean;

  public getControlOption(): ControlOption {
    return {
      value:   this.value ?? this.display,
      display: this.display,
      i18n:    this.i18n
    };
  }

  public toValue(context: KeyValue = {}): ControlOption {
    // TODO : add context support
    return this.getControlOption();
  }

  public validate(): boolean {
    return true;
  }

}

/**
 * @deprecated
 * @param parser
 * @param element
 * @param optionsElement
 */
export function ParseOptionsElement(
  parser: XmlParserService,
  element: RxapElement,
  optionsElement: OptionsElement
): OptionsElement {

  optionsElement.options = [];

  if (element.hasChild('options')) {
    const options          = element.getChild('options')!;
    optionsElement.options = options.getChildren('option').map(child => parser.parse<OptionElement>(child));
  }

  if (element.hasChild('to-display')) {
    const toDisplayTemplate  = element.getChildTextContent('to-display')!;
    const template           = compile(toDisplayTemplate);
    optionsElement.toDisplay = ((value: any, display: any) => !display ? template(value) : display) as any;
  }

  ParseElementWithDataSource(parser, element, optionsElement);

  return optionsElement;
}

class ToDisplayFunctionFactory {

  constructor(public readonly template: Function) {
    this.toDisplay = this.toDisplay.bind(this);
  }

  public toDisplay(value: any, display?: string) {
    if (display === undefined) {
      return this.template(value);
    }
    return display;
  }

}

@ElementDef('to-display')
export class OptionToDisplayElement implements ParsedElement<ToDisplayFunction> {

  @ElementTextContent({
    required:   true,
    parseValue: compile
  })
  public template!: Function;

  public toValue(): ToDisplayFunction {
    return new ToDisplayFunctionFactory(this.template).toDisplay;
  }

}

export type DataSourceInstance = { dataSource: BaseDataSource };
export type DataSourceIdWithViewerOrDataSource = DataSourceIdWithViewer | DataSourceInstance;

export function IsOptionsElementValueWithDataSourceInstance(obj: any): obj is DataSourceInstance {
  return obj.dataSource && obj.dataSource instanceof BaseDataSource;
}

export function AssertOptionsElementValueIsWithDataSourceInstance(obj: any): asserts obj is DataSourceInstance {
  if (!IsOptionsElementValueWithDataSourceInstance(obj)) {
    throw new Error('Options element value is not with a data source instance');
  }
}

@ElementDef('options')
export class OptionsElement implements ParsedElement<DataSourceIdWithViewerOrDataSource>, ParsedElementWithDataSource {

  @ElementChildren(OptionElement)
  public options!: OptionElement[];

  @ElementChild(OptionToDisplayElement)
  public toDisplay?: OptionToDisplayElement;

  @ElementChild(DataSourceElement)
  public dataSource?: DataSourceElement;

  public getControlOptions(): ControlOptions<any> {
    return this.options.map(option => option.getControlOption());
  }

  public toValue(context: KeyValue = {}): DataSourceIdWithViewerOrDataSource {
    if (this.dataSource) {
      return this.dataSource.toValue(context);
    }
    if (this.options) {
      const dataSource = new StaticDataSource<ControlOptions>(
        this.options.map(option => option.toValue(context)),
        { id: 'static-options-from-options-element' }
      );
      return { dataSource };
    }
    throw new Error('Could not transform OptionsElement to value');
  }

  public validate(): boolean {
    return this.options.length !== 0 || !!this.dataSource;
  }

}
