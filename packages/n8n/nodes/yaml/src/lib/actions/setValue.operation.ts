import { decode } from 'iconv-lite';
import has from 'lodash/has';
import {
  deepCopy,
  FieldType,
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  NodeOperationError,
  updateDisplayOptions,
} from 'n8n-workflow';
import { parseDocument } from 'yaml';
import { Document } from 'yaml/dist/doc/Document';
import {
  createBinaryFromJson,
  createBinaryFromJsonAsYAML,
} from '../utils/binary';
import { encodeDecodeOptions } from '../utils/descriptions';
import { validateEntry } from '../utils/set-value';

export type SetField = {
  name: string;
  type: 'stringValue' | 'numberValue' | 'booleanValue' | 'arrayValue' | 'objectValue';
  stringValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  arrayValue?: string[] | string | IDataObject | IDataObject[];
  objectValue?: string | IDataObject;
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Input Yaml Field',
    name: 'dataPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Name of the property which contains the YAML data to where the value should be set',
  },
  {
    displayName: 'Fields to Set',
    name: 'fields',
    placeholder: 'Add Field',
    type: 'fixedCollection',
    description: 'Edit existing fields or add new ones to modify the output data',
    typeOptions: {
      multipleValues: true,
      sortable: true,
    },
    default: {},
    options: [
      {
        name: 'values',
        displayName: 'Values',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            placeholder: 'e.g. fieldName',
            description:
              'Name of the field to set the value of. Supports dot-notation. Example: data.person[0].name.',
            requiresDataPath: 'single',
          },
          {
            displayName: 'Type',
            name: 'type',
            type: 'options',
            description: 'The field value type',
            options: [
              {
                name: 'String',
                value: 'stringValue',
              },
              {
                name: 'Number',
                value: 'numberValue',
              },
              {
                name: 'Boolean',
                value: 'booleanValue',
              },
              {
                name: 'Array',
                value: 'arrayValue',
              },
              {
                name: 'Object',
                value: 'objectValue',
              },
            ],
            default: 'stringValue',
          },
          {
            displayName: 'Value',
            name: 'stringValue',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                type: ['stringValue'],
              },
            },
            validateType: 'string',
            ignoreValidationDuringExecution: true,
          },
          {
            displayName: 'Value',
            name: 'numberValue',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                type: ['numberValue'],
              },
            },
            validateType: 'number',
            ignoreValidationDuringExecution: true,
          },
          {
            displayName: 'Value',
            name: 'booleanValue',
            type: 'options',
            default: 'true',
            options: [
              {
                name: 'True',
                value: 'true',
              },
              {
                name: 'False',
                value: 'false',
              },
            ],
            displayOptions: {
              show: {
                type: ['booleanValue'],
              },
            },
            validateType: 'boolean',
            ignoreValidationDuringExecution: true,
          },
          {
            displayName: 'Value',
            name: 'arrayValue',
            type: 'string',
            default: '',
            placeholder: 'e.g. [ arrayItem1, arrayItem2, arrayItem3 ]',
            displayOptions: {
              show: {
                type: ['arrayValue'],
              },
            },
            validateType: 'array',
            ignoreValidationDuringExecution: true,
          },
          {
            displayName: 'Value',
            name: 'objectValue',
            type: 'json',
            default: '={}',
            typeOptions: {
              rows: 2,
            },
            displayOptions: {
              show: {
                type: ['objectValue'],
              },
            },
            validateType: 'object',
            ignoreValidationDuringExecution: true,
          },
        ],
      },
    ],
  },
  {
    displayName: 'Input Type',
    name: 'inputType',
    type: 'options',
    default: 'auto',
    description: 'The format of the input data',
    options: [
      {
        name: 'Binary',
        value: 'binary',
      },
      {
        name: 'String',
        value: 'string',
      },
      {
        name: 'Auto detecting',
        value: 'auto',
      },
    ],
  },
  {
    displayName: 'Binary Options',
    name: 'binaryOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        inputType: [ 'binary' ],
      },
    },
    options: [
      {
        displayName: 'File Encoding',
        name: 'encoding',
        type: 'options',
        options: encodeDecodeOptions,
        default: 'utf8',
        description: 'Specify the encoding of the file, defaults to UTF-8',
      },
      {
        displayName: 'Strip BOM',
        name: 'stripBOM',
        displayOptions: {
          show: {
            encoding: [ 'utf8', 'cesu8', 'ucs2' ],
          },
        },
        type: 'boolean',
        default: true,
        description:
          'Whether to strip the BOM (Byte Order Mark) from the file, this could help in an environment where the presence of the BOM is causing issues or inconsistencies',
      },
      {
        displayName: 'Keep Source',
        name: 'keepSource',
        type: 'options',
        default: 'json',
        options: [
          {
            name: 'JSON',
            value: 'json',
            description: 'Include JSON data of the input item',
          },
          {
            name: 'Binary',
            value: 'binary',
            description: 'Include binary data of the input item',
          },
          {
            name: 'Both',
            value: 'both',
            description: 'Include both JSON and binary data of the input item',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Set Options',
    name: 'setOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
      {
        displayName: 'Ignore Type Conversion Errors',
        name: 'ignoreConversionErrors',
        type: 'boolean',
        default: false,
        description:
          'Whether to ignore field type errors and apply a less strict type conversion',
        displayOptions: {
          show: {
            '/mode': ['manual'],
          },
        },
      },
    ],
  },
];

const displayOptions = {
  show: {
    operation: [ 'setValue' ],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
  this: IExecuteFunctions,
  items: INodeExecutionData[]
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];

  const dataPropertyName = this.getNodeParameter('dataPropertyName', 0);
  const inputType = this.getNodeParameter('inputType', 0) as string;

  let item: INodeExecutionData;
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    try {
      item = items[itemIndex];

      let yaml: Document.Parsed | null = null;

      let realInputType = inputType;

      if (inputType === 'auto') {
        if (has(item.binary, dataPropertyName)) {
          realInputType = 'binary';
        } else {
          realInputType = 'string';
        }
      }

      if (realInputType === 'binary') {
        if (!has(item.binary, dataPropertyName)) {
          continue;
        }
        const options = this.getNodeParameter('binaryOptions', itemIndex, {}) as IDataObject;
        const encoding = (
                           options['encoding'] as string
                         ) || 'utf8';
        const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, dataPropertyName);
        const decodedValue: string = decode(buffer, encoding, {
          stripBOM: options['stripBOM'] as boolean,
        });
        yaml = parseDocument(decodedValue);
      } else if (realInputType === 'string') {
        if (item.json[dataPropertyName] === undefined) {
          throw new NodeOperationError(
            this.getNode(),
            `Item has no JSON or String property called "${ dataPropertyName }"`,
            { itemIndex },
          );
        }
        yaml = parseDocument(item.json[dataPropertyName] as string);
      } else {
        throw new NodeOperationError(
          this.getNode(),
          `The input type "${ realInputType }" is not known!`,
          { itemIndex },
        );
      }

      const fields = this.getNodeParameter('fields.values', itemIndex, []) as SetField[];

      for (const entry of fields) {
        const options = this.getNodeParameter('setOptions', itemIndex, {}) as IDataObject;
        const { name, value } = validateEntry(
          entry.name,
          entry.type.replace('Value', '') as FieldType,
          entry[entry.type],
          this.getNode(),
          itemIndex,
          options['ignoreConversionErrors'] as boolean,
        );
        yaml.setIn(name.split('.'), value);
      }



      if (realInputType === 'string') {
        returnData.push({
          json: {
            [dataPropertyName]: yaml.toString(),
          }
        });
      } else if (realInputType === 'binary') {
        const options = this.getNodeParameter('binaryOptions', itemIndex, {}) as IDataObject;
        const binaryData = await createBinaryFromJson.call(this, { data: yaml.toString() }, {
          sourceKey: 'data',
          fileName: (options['fileName'] as string) || 'file.txt',
          mimeType: 'text/plain',
          dataIsBase64: false,
          encoding: options['encoding'] as string,
          addBOM: options['addBOM'] as boolean,
          itemIndex: itemIndex,
        });
        returnData.push({
          json: {},
          binary: {
            [dataPropertyName]: binaryData,
          },
          pairedItem: { item: itemIndex },
        });
      }

    } catch (error: any) {
      if (this.continueOnFail()) {
        items[itemIndex] = {
          json: {
            error: error.message,
          },
          pairedItem: {
            item: itemIndex,
          },
        };
        continue;
      }
      throw error;
    }
  }

  return returnData;
}
