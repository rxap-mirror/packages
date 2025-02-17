import { CaptureExecutionError } from '@rxap/n8n-utilities';
import { createHash } from 'crypto';
import { Client as MinioClient } from 'minio';
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

const configuredOutputs = (parameters: INodeParameters) => {
  const operation = parameters['operation'] as 'read' | 'write';

  switch (operation) {

    case 'write':
      return [NodeConnectionType.Main];

    case 'read':
      return [
        {
          displayName: 'Cache',
          type: NodeConnectionType.Main,
        },
        {
          displayName: 'No Cache',
          type: NodeConnectionType.Main,
        },
      ];

    default:
      throw new Error(`Unknown operation "${ operation }"`);

  }

};

export class Cache implements INodeType {

  description: INodeTypeDescription = {
    version: 1,
    name: 'cache',
    displayName: 'Cache',
    description: 'Caches items',
    group: ['input'],
    icon: {
      light: 'file:Cache.svg',
      dark: 'file:Cache.dark.svg',
    },
    defaults: {
      name: 'Cache',
    },
    inputs: [NodeConnectionType.Main],
    outputs: `={{(${ configuredOutputs })($parameter)}}`,
    properties: [
      {
        name: 'bucket',
        displayName: 'Bucket Name',
        type: 'string',
        required: true,
        default: 'n8n-cache',
      },
      {
        name: 'key',
        displayName: 'Key',
        type: 'string',
        required: true,
        default: [],
        typeOptions: {
          multipleValues: true,
        },
      },
      {
        name: 'operation',
        displayName: 'Operation',
        type: 'options',
        options: [
          {
            name: 'Read',
            value: 'read',
            action: 'Read from cache',
          },
          {
            name: 'Write',
            value: 'write',
            action: 'Write to cache',
          },
        ],
        default: 'read',
      },
      {
        name: 'disabled',
        displayName: 'Disabled',
        type: 'boolean',
        default: false,
      },
    ],
    credentials: [
      {
        name: 'minio',
        required: true,
      },
    ],
  };

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {

    const operation = this.getNodeParameter('operation', 0) as 'read' | 'write';
    const items = this.getInputData();
    const credentials = await this.getCredentials('minio') as {
      endPoint: string, port: number, useSSL: boolean, accessKey: string, secretKey: string
    };

    const client = new MinioClient(credentials);

    const noCache: INodeExecutionData[] = [];
    const withCache: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const bucket = this.getNodeParameter('bucket', i) as string;
      const keys = this.getNodeParameter('key', i) as string[];
      const disabled = this.getNodeParameter('disabled', i) as boolean;
      const hash = createHash('sha256').update(JSON.stringify(keys)).digest('hex');
      const destinationObject = `${this.getWorkflow().id ?? 'unknown'}/${ hash }/item.json`;
      const exists = await client.bucketExists(bucket);
      if (!exists) {
        throw new NodeOperationError(this.getNode(), 'Bucket does not exist');
      }

      if (operation === 'write' && !disabled) {
        const metaData = {
          'Content-Type': 'application/json',
        };
        try {
          await client.putObject(bucket, destinationObject, JSON.stringify(item.json, null, 2), undefined, metaData);
        } catch (error: any) {
          throw new NodeOperationError(this.getNode(), `Error storing item in cache: ${ error.message }`);
        }
        for (const [ key, file ] of Object.entries(item.binary ?? {})) {
          const destinationObject = `${ hash }/${ file.fileName }`;
          const metaData = {
            'Content-Type': file.mimeType,
          };
          const buffer = await this.helpers.getBinaryDataBuffer(i, key);
          try {
            await client.putObject(bucket, destinationObject, buffer, undefined, metaData);
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Error storing item in cache: ${ error.message }`);
          }
        }
      }
      if (operation === 'read') {
        if (disabled) {
          noCache[i] = item;
        } else {
          try {
            const dataStream = await client.getObject(bucket, destinationObject);
            let data = '';
            for await (const chunk of dataStream) {
              data += chunk.toString();
            }
            const json = JSON.parse(data);
            withCache[i] = { json };
          } catch (error: any) {
            if (error.code !== 'NoSuchKey') {
              throw new NodeOperationError(this.getNode(), `Error reading item from cache: ${ error.message }`);
            }
            noCache[i] = item;
          }
        }
      }
    }

    if (operation === 'read') {
      return [ withCache, noCache ];
    }

    return [ items ];
  }

}
