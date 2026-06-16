import {
  addFilesToResults,
  CaptureExecutionError,
} from '@rxap/n8n-utilities';
import {
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import {
  IBinaryKeyData,
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow/dist/Interfaces';
import { join } from 'path';
import { Readable } from 'stream';
import { extract } from 'tar';
import { dir } from 'tmp-promise';

export class Tar implements INodeType {
  description: INodeTypeDescription = {
    version: 1,
    description: 'Interact with tar files',
    defaults: { name: 'Tar' },
    name: 'Tar',
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    displayName: 'Tar',
    group: [ 'transform' ],
    icon: 'file:Tar.svg',
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
        name: 'globalFilePathPrefix',
        displayName: 'Global File Path Prefix',
        type: 'string',
        default: '',
        description: 'The prefix for the file path. If set, the file path will be prefixed with the prefix. If not set, the file path will be relative to the root of the zip file.',
        required: false,
      },
      {
        name: 'fileList',
        displayName: 'List of files to extract',
        type: 'string',
        default: [],
        required: true,
        typeOptions: {
          multipleValues: true,
        },
      }
    ],
  };

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

    const items = this.getInputData();

    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const operation = this.getNodeParameter('operation', i) as string;
      const inputDateProperty = this.getNodeParameter('inputDateProperty', i) as string;
      const globalFilePathPrefix = this.getNodeParameter('globalFilePathPrefix', i) as string;
      const fileList = this.getNodeParameter('fileList', i, undefined) as string[] | undefined;

      let buffer: Buffer;

      const {
        path: workDir,
        cleanup,
      } = await dir({ unsafeCleanup: true });

      try {

        switch (operation) {

          case 'extract': {
            buffer = await this.helpers.getBinaryDataBuffer(i, inputDateProperty);

            const bufferStream = Readable.from(buffer);

            await new Promise<void>((resolve, reject) => {
              let x: any;
              if (fileList?.length) {
                x = extract({
                  cwd: workDir,
                  sync: false,
                }, fileList.map(file => join(globalFilePathPrefix, file)));
              } else {
                x = extract({
                  cwd: workDir,
                  sync: false,
                });
              }
              bufferStream
                .pipe(x)
                .on('error', reject)
                .on('close', resolve);
            });

            break;
          }

        }

        const result: INodeExecutionData & { binary: IBinaryKeyData } = {
          json: item.json,
          binary: {},
        };

        await addFilesToResults(join(workDir, globalFilePathPrefix), join(workDir, globalFilePathPrefix), result, this.helpers.prepareBinaryData.bind(this.helpers));
        results[i] = result;
      } catch (e: any) {
        results[i] = {
          ...item,
          error: new NodeOperationError(
            this.getNode(),
            `Failed to extract tar file. Error: ${ e.message }`
          ),
        };
      } finally {
        await cleanup();
      }

    }

    return [ results ];

  }

}
