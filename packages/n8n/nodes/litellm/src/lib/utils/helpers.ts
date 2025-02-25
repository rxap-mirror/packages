import type {
  AiEvent,
  IDataObject,
  IExecuteFunctions,
} from 'n8n-workflow';
import { jsonStringify } from 'n8n-workflow';

export async function logAiEvent(
  executeFunctions: IExecuteFunctions,
  event: AiEvent,
  data?: IDataObject,
) {
  try {
    await executeFunctions.logAiEvent(event, data ? jsonStringify(data) : undefined);
  } catch (error) {
    executeFunctions.logger.debug(`Error logging AI event: ${ event }`);
  }
}
