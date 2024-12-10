import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow/dist/Interfaces';
import * as extract from './actions/extract.operation';
import * as convert from './actions/convert.operation';
import * as jsonToYaml from './actions/jsonToYaml.operation';
import * as yamlToJson from './actions/yamlToJson.operation';
import * as setValue from './actions/setValue.operation';


export class Yaml implements INodeType {

  description: INodeTypeDescription = {
    displayName: 'YAML',
    name: 'yaml',
    icon: 'file:yaml.svg',
    group: ['input'],
    version: 1,
    description: 'Convert data to YAML or from YAML',
    defaults: {
      name: 'YAML',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'extract',
        options: [
          {
            name: 'Extract From YAML',
            value: 'extract',
            action: 'Extract from YAML',
            description: 'Transform YAML data into output items',
          },
          {
            name: 'Convert to YAML',
            value: 'convert',
            action: 'Convert to YAML',
            description: 'Transform input data into YAML file',
          },
          {
            name: 'JSON to YAML',
            value: 'jsonToYaml',
            description: 'Converts data from JSON to YAML',
          },
          {
            name: 'YAML to JSON',
            value: 'yamlToJson',
            description: 'Converts data from YAML to JSON',
          },
          {
            name: 'Set value in YAML',
            value: 'setValue',
            description: 'Converts data from YAML to JSON',
          },
        ]
      },
      ...extract.description,
      ...convert.description,
      ...yamlToJson.description,
      ...jsonToYaml.description,
      ...setValue.description,
    ]
  };

  async execute(this: IExecuteFunctions) {

    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0);
    let returnData: INodeExecutionData[] = [];

    if (operation === 'extract') {
      returnData = await extract.execute.call(this, items);
    }

    if (operation === 'convert') {
      returnData = await convert.execute.call(this, items);
    }

    if (operation === 'jsonToYaml') {
      returnData = await jsonToYaml.execute.call(this, items);
    }

    if (operation === 'yamlToJson') {
      returnData = await yamlToJson.execute.call(this, items);
    }

    if (operation === 'setValue') {
      returnData = await setValue.execute.call(this, items);
    }

    return [returnData];

  }

}
