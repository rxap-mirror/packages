import {
  deepCopy,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  NodeOperationError,
  updateDisplayOptions,
} from 'n8n-workflow';
import { parse } from 'yaml';

export const properties: INodeProperties[] = [
  {
    displayName:
      "If your YAML is inside a binary file, use the 'Extract YAML from File' node to convert it to text first",
    name: 'yamlNotice',
    type: 'notice',
    default: ''
  },
  {
    displayName: 'Input Yaml Field',
    name: 'dataPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Name of the property which contains the YAML data to convert',
  },
];

const displayOptions = {
  show: {
    operation: ['yamlToJson'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];

  const dataPropertyName = this.getNodeParameter('dataPropertyName', 0);

  let item: INodeExecutionData;
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    try {
      item = items[itemIndex];

      if (item.json[dataPropertyName] === undefined) {
        throw new NodeOperationError(
          this.getNode(),
          `Item has no JSON property called "${dataPropertyName}"`,
          { itemIndex },
        );
      }

      const json = parse(item.json[dataPropertyName] as string);
      returnData.push({ json: deepCopy(json) });

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
