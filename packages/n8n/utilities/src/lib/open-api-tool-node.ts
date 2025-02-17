import {
  INodeTypeDescription,
  NodeConnectionType,
  SupplyData,
} from 'n8n-workflow';
import { OpenApiNode } from './open-api-node';

export abstract class OpenApiToolNode extends OpenApiNode {

  constructor(
    openApiFilePath: string,
    description: Partial<INodeTypeDescription> = {},
    nameSuffix = 'tool',
  ) {
    super(
      openApiFilePath,
      {
        inputs: [],
        outputs: [NodeConnectionType.AiTool],
        ...description,
      },
      nameSuffix,
    );
  }

  supplyData(itemIndex: number): Promise<SupplyData> {
    throw new Error('Method not implemented.');
  }

}
