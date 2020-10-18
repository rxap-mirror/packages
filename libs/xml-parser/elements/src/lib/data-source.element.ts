import {
  RxapElement,
  ElementParser,
  ParsedElement,
  RequiredProperty,
  XmlParserService,
  parseValue
} from '@rxap/xml-parser';
import {
  KeyValue,
  hasIndexSignature,
  camelize,
  uuid
} from '@rxap/utilities';
import { compile } from 'handlebars';
import { BaseDataSourceViewer } from '@rxap/data-source';

export function ParseDataSourceElement(
  parser: XmlParserService,
  element: RxapElement,
  parsedElement: DataSourceElement = new DataSourceElement()
): DataSourceElement {

  if (element.hasChildren()) {

    parsedElement.id = element.getChildTextContent('id');

    if (element.hasChild('viewer')) {
      const viewerElement     = element.getChild('viewer')!;
      parsedElement.rawViewer = {};
      for (const child of viewerElement.getAllChildNodes()) {
        const propertyKey                      = camelize(child.name);
        parsedElement.rawViewer[ propertyKey ] = child.getTextContent(undefined, true);
      }
    }

  } else {
    parsedElement.id = element.getTextContent();
  }

  parsedElement.local = element.getBoolean('local', false)!;

  return parsedElement;
}

export interface DataSourceIdWithViewer {
  viewer: BaseDataSourceViewer;
  dataSourceId: string | null;
}

export function IsDataSourceElementWithDataSourceIdAndViewer(obj: any): obj is DataSourceIdWithViewer {
  return obj.hasOwnProperty('viewer') && obj.hasOwnProperty('dataSourceId');
}

export function AssetsDataSourceElementValueIsDataSourceIdAndViewer(obj: any): asserts obj is DataSourceIdWithViewer {
  if (!IsDataSourceElementWithDataSourceIdAndViewer(obj)) {
    throw new Error('Data source element value is not data source id and viewer');
  }
}

@ElementParser('data-source', ParseDataSourceElement)
export class DataSourceElement implements ParsedElement<DataSourceIdWithViewer> {

  @RequiredProperty() public id!: string;

  public local: boolean = false;

  public rawViewer: KeyValue<string> = {};

  public getViewer(context: KeyValue = {}): BaseDataSourceViewer {
    const viewer = { ...this.rawViewer };
    for (const key of Object.keys(viewer)) {
      viewer[ key ] = parseValue(compile(viewer[ key ])({ context, uuid: uuid() }));
    }
    return viewer;
  }

  public toValue(context: KeyValue = {}): DataSourceIdWithViewer {
    const viewer = this.getViewer(context);
    return {
      viewer,
      dataSourceId: this.id
    };
  }

  public validate(): boolean {
    return typeof this.rawViewer === 'object';
  }

}

export interface ParsedElementWithDataSource extends ParsedElement {
  dataSource?: DataSourceElement;
}

export function ParseElementWithDataSource(
  parser: XmlParserService,
  element: RxapElement,
  parsedElement: ParsedElementWithDataSource
): ParsedElementWithDataSource {

  if (element.hasChild('data-source')) {
    parsedElement.dataSource = parser.parse<DataSourceElement>(element.getChild('data-source')!, DataSourceElement);
  }

  return parsedElement;

}

export function IsElementWithDataSource(element: ParsedElement): element is Required<ParsedElementWithDataSource> {
  return element.hasOwnProperty('dataSource') && hasIndexSignature(element) && element[ 'dataSource' ] instanceof DataSourceElement;
}


