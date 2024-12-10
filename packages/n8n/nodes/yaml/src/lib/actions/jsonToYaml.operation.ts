import get from 'lodash/get';
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  updateDisplayOptions,
} from 'n8n-workflow';
import { stringify } from 'yaml';

export const properties: INodeProperties[] = [
  {
    displayName: 'Input Json Field',
    name: 'dataPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Name of the property which contains the JSON data',
  },
  {
    displayName: 'Destination Output Field',
    name: 'destinationKey',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g data',
    description: 'Name of the property to which to contains the converted YAML data',
  },
];

const displayOptions = {
  show: {
    operation: ['jsonToYaml'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];

  const dataPropertyName = this.getNodeParameter('dataPropertyName', 0);
  const destinationKey = this.getNodeParameter('destinationKey', 0) as string;

  let item: INodeExecutionData;
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    try {
      item = items[itemIndex];

      const value = get(item.json, dataPropertyName);

      returnData.push({
        json: {
          [destinationKey]: stringify(value),
        },
        pairedItem: {
          item: itemIndex,
        },
      });

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
