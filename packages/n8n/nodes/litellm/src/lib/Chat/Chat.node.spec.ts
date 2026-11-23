import { NodeApiError } from 'n8n-workflow';
import { OpenAIClient } from '@langchain/openai';
import { Chat } from './Chat.node';

const mockChatOpenAI = jest.fn();
// the error class has to come from the openai copy that @langchain/openai nests (OpenAIClient.RateLimitError),
// not from the workspace `openai` package: that is a different class and `instanceof` would never match
jest.mock('@langchain/openai', () => ({
  OpenAIClient: {
    RateLimitError: class RateLimitError extends Error {
      constructor(public code?: string) {
        super('rate limit');
      }
    },
  },
  ChatOpenAI: jest.fn().mockImplementation((args: unknown) => {
    mockChatOpenAI(args);
    return { kind: 'chat-model', args };
  }),
}));


const FakeRateLimitError = OpenAIClient.RateLimitError as unknown as new (code?: string) => Error;

function ctx(options: Record<string, unknown> = {}) {
  return {
    getCredentials: jest.fn(async () => ({ apiKey: 'key', baseURL: 'http://litellm' })),
    getNodeParameter: jest.fn((name: string, _i: number, fb?: unknown) =>
      name === 'model' ? 'gpt-x' : name === 'options' ? options : fb,
    ),
    getNode: () => ({ name: 'n', type: 't', typeVersion: 1, position: [0, 0], parameters: {}, id: '1' }),
  } as any;
}

describe('Chat node', () => {
  const node = new Chat();

  beforeEach(() => mockChatOpenAI.mockClear());

  it('describes a language model sub node', () => {
    expect(node.description.name).toBe('liteLLMChat');
    expect(node.description.inputs).toEqual([]);
    expect(node.description.credentials).toEqual([{ name: 'litellm', required: true }]);
    expect(node.description.properties.map((p) => p.name)).toEqual(
      expect.arrayContaining(['notice', 'model', 'options']),
    );
  });

  it('supplies a ChatOpenAI configured from credentials and options', async () => {
    const res = await node.supplyData.call(ctx({ temperature: 0.5, timeout: 1000, maxRetries: 5 }), 0);
    const args = mockChatOpenAI.mock.calls[0][0];
    expect(res.response).toMatchObject({ kind: 'chat-model' });
    expect(args).toMatchObject({
      openAIApiKey: 'key',
      modelName: 'gpt-x',
      temperature: 0.5,
      timeout: 1000,
      maxRetries: 5,
      configuration: { baseURL: 'http://litellm' },
      modelKwargs: undefined,
    });
    expect(args.callbacks).toHaveLength(1);
  });

  it('applies defaults and the response format', async () => {
    await node.supplyData.call(ctx({ responseFormat: 'json_object' }), 0);
    const args = mockChatOpenAI.mock.calls[0][0];
    expect(args.timeout).toBe(60000);
    expect(args.maxRetries).toBe(2);
    expect(args.modelKwargs).toEqual({ response_format: { type: 'json_object' } });
  });

  describe('onFailedAttempt', () => {
    const getHandler = async () => {
      await node.supplyData.call(ctx(), 0);
      return mockChatOpenAI.mock.calls[0][0].onFailedAttempt as (e: any) => never;
    };

    it('rethrows generic errors', async () => {
      const h = await getHandler();
      const err = new Error('x');
      expect(() => h(err)).toThrow(err);
    });

    it('wraps rate limit errors with a custom message', async () => {
      const h = await getHandler();
      try {
        h(new FakeRateLimitError('insufficient_quota'));
        fail('should throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(NodeApiError);
        expect(e.message).toBe('OpenAI: Insufficient quota');
      }
    });

    it('wraps rate limit errors with unknown codes without changing the message', async () => {
      const h = await getHandler();
      expect(() => h(new FakeRateLimitError('other'))).toThrow(NodeApiError);
    });

    it('rethrows rate limit errors without a code', async () => {
      const h = await getHandler();
      const err = new FakeRateLimitError();
      expect(() => h(err)).toThrow(err);
    });
  });
});
