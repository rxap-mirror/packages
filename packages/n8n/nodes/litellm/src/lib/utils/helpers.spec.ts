import { getCustomErrorMessage } from '../error-handling';
import { LiteLLM } from '../LiteLLM.credentials';
import {
  getMetadataFiltersValues,
  isBaseChatMemory,
  isBaseChatMessageHistory,
  isToolsInstance,
  logAiEvent,
} from './helpers';

describe('getCustomErrorMessage', () => {
  it('maps known codes', () => {
    expect(getCustomErrorMessage('insufficient_quota')).toBe('OpenAI: Insufficient quota');
    expect(getCustomErrorMessage('rate_limit_exceeded')).toBe('OpenAI: Rate limit reached');
  });

  it('returns undefined for unknown codes', () => {
    expect(getCustomErrorMessage('other')).toBeUndefined();
  });
});

describe('LiteLLM credentials', () => {
  const cred = new LiteLLM();

  it('describes the api key and base url', () => {
    expect(cred.name).toBe('litellm');
    expect(cred.properties.map((p) => p.name)).toEqual(['apiKey', 'baseURL']);
    expect(cred.properties[0].typeOptions).toEqual({ password: true });
  });

  it('authenticates with a bearer header and tests /v1/models', () => {
    expect((cred.authenticate as any).properties.headers.Authorization).toBe('=Bearer {{$credentials.apiKey}}');
    expect(cred.test.request).toEqual({ baseURL: '={{$credentials.baseURL}}', url: '/v1/models' });
  });
});

describe('getMetadataFiltersValues', () => {
  const ctx = (options: any, jsonValue?: unknown) =>
    ({
      getNodeParameter: jest.fn((name: string, _i: number, fb: unknown) =>
        name === 'options' ? options : jsonValue ?? fb,
      ),
    }) as any;

  it('merges metadata name/value pairs', () => {
    const c = ctx({ metadata: { metadataValues: [{ name: 'a', value: '1' }, { name: 'b', value: '2' }] } });
    expect(getMetadataFiltersValues(c, 0)).toEqual({ a: '1', b: '2' });
  });

  it('falls back to the json filter when metadata is empty', () => {
    const c = ctx({ metadata: { metadataValues: [] }, searchFilterJson: '{"x":1}' }, { x: 1 });
    expect(getMetadataFiltersValues(c, 2)).toEqual({ x: 1 });
    expect(c.getNodeParameter).toHaveBeenCalledWith('options.searchFilterJson', 2, '', { ensureType: 'object' });
  });

  it('returns undefined without filters', () => {
    expect(getMetadataFiltersValues(ctx({}), 0)).toBeUndefined();
  });
});

describe('type guards', () => {
  it('isBaseChatMemory', () => {
    expect(isBaseChatMemory({ loadMemoryVariables: () => 1, saveContext: () => 1 })).toBe(true);
    expect(isBaseChatMemory({ loadMemoryVariables: () => 1 })).toBe(false);
    expect(isBaseChatMemory(null)).toBe(false);
    expect(isBaseChatMemory('x')).toBe(false);
    expect(isBaseChatMemory({ loadMemoryVariables: 1, saveContext: 2 })).toBe(false);
  });

  it('isBaseChatMessageHistory', () => {
    expect(isBaseChatMessageHistory({ getMessages: () => 1, addMessage: () => 1 })).toBe(true);
    expect(isBaseChatMessageHistory({})).toBe(false);
  });

  it('isToolsInstance', () => {
    expect(isToolsInstance({ lc_namespace: ['langchain', 'tools'] })).toBe(true);
    expect(isToolsInstance({ lc_namespace: ['x'] })).toBe(false);
    expect(isToolsInstance({})).toBe(false);
    expect(isToolsInstance(undefined)).toBe(false);
  });
});

describe('logAiEvent', () => {
  it('serializes the data', () => {
    const ctx: any = { logAiEvent: jest.fn(), logger: { debug: jest.fn() } };
    logAiEvent(ctx, 'ai-tool-called', { a: 1 });
    expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-tool-called', '{"a":1}');
    logAiEvent(ctx, 'ai-tool-called');
    expect(ctx.logAiEvent).toHaveBeenLastCalledWith('ai-tool-called', undefined);
  });

  it('swallows errors and logs them', () => {
    const ctx: any = {
      logAiEvent: jest.fn(() => {
        throw new Error('x');
      }),
      logger: { debug: jest.fn() },
    };
    expect(() => logAiEvent(ctx, 'ai-tool-called')).not.toThrow();
    expect(ctx.logger.debug).toHaveBeenCalledWith('Error logging AI event: ai-tool-called');
  });
});
