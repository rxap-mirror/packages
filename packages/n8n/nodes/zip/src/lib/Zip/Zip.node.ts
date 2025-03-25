import { addFilesToResults } from '@rxap/n8n-utilities';
import AdmZip from 'adm-zip';
import {
  readdirSync,
  readFileSync,
} from 'fs';
import {
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import {
  IBinaryData,
  IBinaryKeyData,
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow/dist/Interfaces';
import { statSync } from 'fs';
import {
  join,
  relative,
} from 'path';
import type { Readable } from 'stream';
import { dir } from 'tmp-promise';

export class Zip implements INodeType {
  description: INodeTypeDescription = {
    version: 1,
    description: 'Interact with zip files',
    defaults: { name: 'Zip' },
    name: 'rxapZip',
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    displayName: 'Zip',
    group: [ 'transform' ],
    icon: 'file:Zip.svg',
    properties: [
      {
        name: 'operation',
        displayName: 'Operation',
        default: 'extract',
        type: 'options',
        required: true,
        options: [
          {
            name: 'Extract',
            value: 'extract',
          },
        ],
      },
      {
        name: 'inputDateProperty',
        displayName: 'Input Date Property',
        type: 'string',
        default: 'data',
        description: 'The name of the binary property which contains the zip file',
        required: true,
      },
      {
        name: 'password',
        displayName: 'Unzip Password',
        type: 'string',
        default: '',
        description: 'The password used to unzip the zip file. If the zip file is not encrypted, leave it empty.',
        required: false,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

    const items = this.getInputData();

    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const operation = this.getNodeParameter('operation', i) as string;
      const inputDateProperty = this.getNodeParameter('inputDateProperty', i) as string;
      const password = this.getNodeParameter('password', i, '') as string;

      let zip: AdmZip;
      let buffer: Buffer;

      const {
        path: workDir,
        cleanup,
      } = await dir({ unsafeCleanup: true });

      try {
        switch (operation) {

          case 'extract':
            // Implement your logic here
            buffer = await this.helpers.getBinaryDataBuffer(i, inputDateProperty);
            zip = new AdmZip(buffer);
            if (password) {
              if (!zip.test(password)) {
                throw new NodeOperationError(this.getNode(), 'Password is incorrect');
              }
            }
            zip.extractAllTo(workDir, true, false, password);
            break;

        }

        const result: INodeExecutionData & { binary: IBinaryKeyData } = {
          json: item.json,
          binary: {}
        };

        await addFilesToResults(workDir, workDir, result, this.helpers.prepareBinaryData.bind(this.helpers));
        results[i] = result;
      } finally {
        await cleanup();
      }

    }

    return [ results ];

  }

}
