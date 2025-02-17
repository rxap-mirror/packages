import { DeleteUndefinedProperties } from '@rxap/utilities';
import {
  IExecuteSingleFunctions,
  IN8nHttpFullResponse,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';
import { basename } from 'path';

export class Download implements INodeType {

  description: INodeTypeDescription = {
    version: 1,
    description: 'Download a file from IPFS',
    defaults: {
      name: 'Download',
    },
    name: 'ipfsDownload',
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    subtitle: `={{ $parameter["operation"].split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') }}`,
    displayName: 'Download',
    group: ['transform'],
    requestDefaults: {},
    icon: 'file:Download.svg',
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        default: 'download-as-file',
        options: [
          {
            name: 'Download as File',
            value: 'download-as-file',
            description: 'Download a file from IPFS as binary data.',
            action: 'Download as File',
            routing: {
              request: {
                method: 'GET',
                url: `={{ $parameter["path"] }}`,
                baseURL: `={{ $parameter["gateway"].replace('<<cid>>', $parameter["cid"]) }}`,
              },
              output: {
                postReceive: [
                  {
                    type: 'binaryData',
                    properties: {
                      destinationProperty: 'data'
                    }
                  },
                  async function (
                    this: IExecuteSingleFunctions, items: INodeExecutionData[],
                    response: IN8nHttpFullResponse,
                  ): Promise<INodeExecutionData[]> {
                    const path = this.getNodeParameter('path', null) as string | null;
                    const mimeType = this.getNodeParameter('mimeType', null) as string | null;
                    const overwriteFileName = this.getNodeParameter('overwriteFileName', null) as string | null;
                    for (const item of items) {
                      if (item.binary?.['data']) {
                        const data = item.binary['data'];
                        // use || instead of ?? to replace empty string
                        data.fileName = overwriteFileName || (
                          path ? basename(path) : data.fileName
                        );
                        // use || instead of ?? to replace empty string
                        data.mimeType = mimeType || data.mimeType;
                        // use || instead of ?? to replace empty string
                        data.fileExtension = data.fileName?.split('.').pop() || data.fileExtension;
                        switch (data.mimeType) {
                          case 'application/json':
                            data.fileType = 'json';
                            break;
                          case 'text/plain':
                            data.fileType = 'text';
                            break;
                          case 'application/pdf':
                            data.fileType = 'pdf';
                            break;
                          case 'image/jpeg':
                          case 'image/png':
                            data.fileType = 'image';
                            break;
                          case 'application/xhtml+xml':
                          case 'text/html':
                            data.fileType = 'html';
                            break;
                        }
                      }
                    }
                    return items.map((item, index) => {
                      if (item.binary?.['data'] && (!item.json || Object.keys(item.json).length === 0)) {
                        const data = item.binary['data'];
                        item.json = {
                          file: DeleteUndefinedProperties({
                            mimeType: data.mimeType,
                            fileName: data.fileName,
                            fileExtension: data.fileExtension,
                            fileType: data.fileType,
                            directory: data.directory,
                            fileSize: data.fileSize,
                            id: data.id,
                          }),
                          input: this.getInputData(index),
                        }
                      }
                      return item;
                    });
                  }
                ]
              }
            }
          },
          {
            name: 'Download as JSON',
            value: 'download-as-json',
            description: 'Download a file from IPFS as JSON.',
            action: 'Download as JSON',
            routing: {
              request: {
                method: 'GET',
                url: `={{ $parameter["path"] }}`,
                baseURL: `={{ $parameter["gateway"].replace('<<cid>>', $parameter["cid"]) }}`,
              },
              output: {
                postReceive: [
                  async function(this: IExecuteSingleFunctions, items: INodeExecutionData[], response: IN8nHttpFullResponse): Promise<INodeExecutionData[]> {
                    const data = response.body?.toString();
                    if (data) {
                      return [
                        {
                          json: JSON.parse(data)
                        }
                      ];
                    }
                    return [];
                  }
                ]
              }
            }
          },
          {
            name: 'Download as Text',
            value: 'download-as-text',
            description: 'Download a file from IPFS as Text.',
            action: 'Download as Text',
            routing: {
              request: {
                method: 'GET',
                url: `={{ $parameter["path"] }}`,
                baseURL: `={{ $parameter["gateway"].replace('<<cid>>', $parameter["cid"]) }}`,
              },
              output: {
                postReceive: [
                  async function(this: IExecuteSingleFunctions, items: INodeExecutionData[], response: IN8nHttpFullResponse): Promise<INodeExecutionData[]> {
                    const data = response.body?.toString();
                    if (data) {
                      return [
                        {
                          json: { content: data }
                        }
                      ];
                    }
                    return [];
                  }
                ]
              }
            }
          }
        ]
      },
      {
        displayName: 'IPFS Gateway',
        name: 'gateway',
        type: 'options',
        default: 'https://<<cid>>.ipfs.w3s.link',
        description: 'The IPFS gateway to use.',
        options: [
          {
            name: 'Web3 Storage',
            value: 'https://<<cid>>.ipfs.w3s.link',
          }
        ]
      },
      {
        displayName: 'CID',
        name: 'cid',
        type: 'string',
        default: '',
        required: true,
        description: 'The CID of the file to download.',
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '',
        description: 'The path of the file to download.',
      },
      {
        displayName: 'Mime Type',
        name: 'mimeType',
        type: 'string',
        default: '',
        description: 'Set the mime type of the downloaded file.',
        displayOptions: {
          show: {
            operation: [ 'download-as-file' ],
          },
        },
      },
      {
        displayName: 'Overwrite File Name',
        name: 'overwriteFileName',
        type: 'string',
        default: '',
        description: 'Overwrite the file name of the downloaded file.',
        displayOptions: {
          show: {
            operation: [ 'download-as-file' ],
          },
        },
      }
    ]
  };

}
