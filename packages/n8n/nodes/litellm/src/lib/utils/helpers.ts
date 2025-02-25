import type { BaseChatMessageHistory } from '@langchain/core/chat_history';
import type { Tool } from '@langchain/core/tools';
import type { BaseChatMemory } from 'langchain/memory';
import type {
  AiEvent,
  IDataObject,
  IExecuteFunctions,
} from 'n8n-workflow';
import { jsonStringify } from 'n8n-workflow';

function hasMethods<T>(obj: unknown, ...methodNames: Array<string | symbol>): obj is T {
  return methodNames.every(
    (methodName) =>
      typeof obj === 'object' &&
      obj !== null &&
      methodName in obj &&
      typeof (obj as Record<string | symbol, unknown>)[methodName] === 'function',
  );
}

export function getMetadataFiltersValues(
  ctx: IExecuteFunctions,
  itemIndex: number,
): Record<string, never> | undefined {
  const options = ctx.getNodeParameter('options', itemIndex, {});

  if (options['metadata']) {
    const { metadataValues: metadata } = options['metadata'] as {
      metadataValues: Array<{
        name: string;
        value: string;
      }>;
    };
    if (metadata.length > 0) {
      return metadata.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
    }
  }

  if (options['searchFilterJson']) {
    return ctx.getNodeParameter('options.searchFilterJson', itemIndex, '', {
      ensureType: 'object',
    }) as Record<string, never>;
  }

  return undefined;
}

export function isBaseChatMemory(obj: unknown) {
  return hasMethods<BaseChatMemory>(obj, 'loadMemoryVariables', 'saveContext');
}

export function isBaseChatMessageHistory(obj: unknown) {
  return hasMethods<BaseChatMessageHistory>(obj, 'getMessages', 'addMessage');
}

export function isToolsInstance(model: unknown): model is Tool {
  const namespace = (model as Tool)?.lc_namespace ?? [];

  return namespace.includes('tools');
}

export async function logAiEvent(
  executeFunctions: IExecuteFunctions,
  event: AiEvent,
  data?: IDataObject,
) {
  try {
    await executeFunctions.logAiEvent(event, data ? jsonStringify(data) : undefined);
  } catch (error) {
    executeFunctions.logger.debug(`Error logging AI event: ${event}`);
  }
}
