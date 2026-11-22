import { Embeddings as EmbeddingsNode } from './Embeddings.node';

const mockEmbeddingsCtor = jest.fn();
jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation((args: unknown) => {
    mockEmbeddingsCtor(args);
    return { kind: 'embeddings' };
  }),
}));

const mockLogWrapper = jest.fn((i: unknown) => ({ wrapped: i }));
jest.mock('../utils/logWrapper', () => ({ logWrapper: (...a: any[]) => (mockLogWrapper as any)(...a) }));

function ctx(options: Record<string, unknown>, model = 'text-embedding-3-small') {
  return {
    logger: { debug: jest.fn() },
    getCredentials: jest.fn(async () => ({ apiKey: 'key', baseURL: 'http://litellm' })),
    getNodeParameter: jest.fn((name: string, _i: number, fb?: unknown) =>
      name === 'model' ? model : name === 'options' ? options : fb,
    ),
  } as any;
}

describe('Embeddings node', () => {
  const node = new EmbeddingsNode();

  beforeEach(() => {
    mockEmbeddingsCtor.mockClear();
    mockLogWrapper.mockClear();
  });

  it('describes an embedding sub node', () => {
    expect(node.description.credentials).toEqual([{ name: 'litellm', required: true }]);
    expect(node.description.properties.map((p) => p.name)).toEqual(expect.arrayContaining(['model', 'options']));
  });

  it('supplies wrapped embeddings configured from credentials', async () => {
    const c = ctx({ batchSize: 100, stripNewLines: false, timeout: 30 }, 'embed-1');
    const res = await node.supplyData.call(c, 0);
    expect(mockEmbeddingsCtor).toHaveBeenCalledWith({
      modelName: 'embed-1',
      openAIApiKey: 'key',
      batchSize: 100,
      stripNewLines: false,
      timeout: 30,
      configuration: { baseURL: 'http://litellm' },
    });
    expect(mockLogWrapper).toHaveBeenCalledWith({ kind: 'embeddings' }, c);
    expect(res.response).toEqual({ wrapped: { kind: 'embeddings' } });
  });

  it('treats a timeout of -1 as no timeout', async () => {
    await node.supplyData.call(ctx({ timeout: -1 }), 0);
    expect(mockEmbeddingsCtor.mock.calls[0][0].timeout).toBeUndefined();
  });
});
