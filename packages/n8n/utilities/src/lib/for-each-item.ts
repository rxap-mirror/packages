import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export async function forEachItem(
  this: IExecuteFunctions,
  callback: (this: IExecuteFunctions, item: INodeExecutionData, index: number, array: INodeExecutionData[]) => INodeExecutionData | Promise<INodeExecutionData>,
): Promise<INodeExecutionData[]> {
  const items = this.getInputData();
  const results: INodeExecutionData[] = [];
  for (let i = 0; i < items.length; i++) {
    try {
      results[i] = await callback.call(this, items[i], i, items);
    } catch (error: any) {
      if (error instanceof NodeOperationError) {
        results[i] = {
          json: {},
          error
        };
      } else {
        results[i] = {
          json: {},
          error: new NodeOperationError(this.getNode(), error)
        };
      }
    }
  }
  return results;
}
