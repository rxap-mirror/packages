import { decode } from 'iconv-lite';
import has from 'lodash/has';
import {
  deepCopy,
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
    displayName: 'Property path',
    name: 'propertyKey',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Property path where the value should be set',
  },
  {
    displayName: 'Property value',
    name: 'propertyValue',
    type: 'json',
    default: 'data',
    required: true,
    description: 'Property path where the value should be set',
  },
  {
    displayName: 'Input Type',
    name: 'inputType',
    type: 'options',
    default: 'auto',
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
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        inputType: [ 'binary', 'auto' ],
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
];

const displayOptions = {
  show: {
    operation: [ 'setValue' ],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
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
        const options = this.getNodeParameter('options', itemIndex);
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

      const propertyKey = this.getNodeParameter('propertyKey', itemIndex) as string;
      const propertyValue = this.getNodeParameter('propertyValue', itemIndex) as string;
      yaml.setIn(propertyKey.split('.'), propertyValue);

      if (realInputType === 'string') {
        returnData.push({
          json: {
            [dataPropertyName]: yaml.toString(),
          }
        });
      } else if (realInputType === 'binary') {
        const options = this.getNodeParameter('options', itemIndex, {});
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
      if (this.continueOnFail(error)) {
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
