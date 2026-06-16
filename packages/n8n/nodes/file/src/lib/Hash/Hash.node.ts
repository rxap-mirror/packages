import { createHash } from 'crypto';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-workflow/dist/Interfaces';

export class Hash implements INodeType {

  description: INodeTypeDescription = {
    version: 1,
    name: 'fileHash',
    displayName: 'Hash File',
    description: 'Calculate the hash of a file',
    defaults: {
      name: 'Hash',
    },
    group: ['transform'],
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    icon: { light: 'file:Hash.svg', dark: 'file:Hash.svg' },
    properties: [
      {
        name: 'operation',
        displayName: 'Hash Algorithm',
        type: 'options',
        default: 'sha256',
        options: [
          {
            name: 'SHA-256',
            value: 'sha256',
          },
          {
            name: 'MD5',
            value: 'md5',
          },
          {
            name: 'SHA-1',
            value: 'sha1',
          },
          {
            name: 'SHA-512',
            value: 'sha512',
          },
          {
            name: 'SHA-384',
            value: 'sha384',
          },
          {
            name: 'RIPEMD160',
            value: 'ripemd160',
          },
          {
            name: 'WHIRLPOOL',
            value: 'whirlpool',
          }
        ]
      },
      {
        displayName: 'Input Binary Field',
        name: 'binaryProperty',
        type: 'string',
        hint: 'The name of the input binary field containing the file to be written',
        default: 'data',
      },
      {
        displayName: 'Output Hash Field',
        name: 'outputHashField',
        type: 'string',
        hint: 'The name of the field to which the hash should be written',
        default: 'hash',
      }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

    const items = this.getInputData();

    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++){
      const item = items[i];

      const operation = this.getNodeParameter('operation', i, item) as string;
      const binaryProperty = this.getNodeParameter('binaryProperty', i, item) as string;
      const outputHashField = this.getNodeParameter('outputHashField', i, item) as string;

      const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

      const hash = createHash(operation).update(buffer).digest('hex');

      results[i] = {
        json: {
          ...item.json,
          [outputHashField]: hash
        },
        binary: item.binary
      };

    }

    return [results];

  }

}
