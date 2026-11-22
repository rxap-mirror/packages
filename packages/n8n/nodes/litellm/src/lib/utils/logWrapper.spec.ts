import { Embeddings } from '@langchain/core/embeddings';
import { BaseRetriever } from '@langchain/core/retrievers';
import { VectorStore } from '@langchain/core/vectorstores';
import { TextSplitter } from '@langchain/textsplitters';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { N8nBinaryLoader } from './N8nBinaryLoader';
import { N8nJsonLoader } from './N8nJsonLoader';
import { callMethodAsync, logWrapper } from './logWrapper';

function createCtx() {
  let counter = 0;
  return {
    addInputData: jest.fn(() => ({ index: counter++ })),
    addOutputData: jest.fn(),
    getNode: jest.fn(() => ({ name: 'node', type: 't', typeVersion: 1, position: [0, 0], parameters: {}, id: '1' })),
    logAiEvent: jest.fn(),
    logger: { debug: jest.fn() },
  } as any;
}

describe('callMethodAsync', () => {
  it('returns the method result with the given this', async () => {
    const ctx = createCtx();
    const res = await callMethodAsync.call({ v: 2 }, {
      executeFunctions: ctx,
      connectionType: NodeConnectionType.AiTool,
      currentNodeRunIndex: 0,
      method: async function (this: any, a: number) {
        return this.v * a;
      },
      arguments: [3],
    });
    expect(res).toBe(6);
    expect(ctx.addOutputData).not.toHaveBeenCalled();
  });

  it('records the error on the node and rethrows a NodeOperationError', async () => {
    const ctx = createCtx();
    await expect(
      callMethodAsync.call({}, {
        executeFunctions: ctx,
        connectionType: NodeConnectionType.AiTool,
        currentNodeRunIndex: 5,
        method: async () => {
          throw new Error('failed');
        },
        arguments: [],
      }),
    ).rejects.toMatchObject({ message: 'failed', description: 'failed' });
    expect(ctx.addOutputData).toHaveBeenCalledWith(
      NodeConnectionType.AiTool,
      5,
      expect.any(NodeOperationError),
      undefined,
    );
  });

  it('uses a generic message when the error has none', async () => {
    const ctx = createCtx();
    const err: any = new Error('');
    await expect(
      callMethodAsync.call({}, {
        executeFunctions: ctx,
        connectionType: NodeConnectionType.AiTool,
        currentNodeRunIndex: 0,
        method: async () => {
          throw err;
        },
        arguments: [],
      }),
    ).rejects.toThrow(/Error on node "node" which is connected via input "ai_tool"/);
  });
});

describe('logWrapper', () => {
  let ctx: ReturnType<typeof createCtx>;
  beforeEach(() => (ctx = createCtx()));

  const outputOf = (i = 0) => ctx.addOutputData.mock.calls[i];

  it('passes through unknown properties of unknown instances', () => {
    const doc: any = { pageContent: 'x' };
    expect((logWrapper(doc, ctx) as any).pageContent).toBe('x');
  });

  describe('chat memory', () => {
    const memory = () => ({
      loadMemoryVariables: jest.fn(async () => ({ chat_history: ['m1'] })),
      saveContext: jest.fn(async () => ({})),
      chatHistory: { getMessages: jest.fn(async () => ['m1', 'm2']) },
    });

    it('wraps loadMemoryVariables', async () => {
      const m = memory();
      const res = await (logWrapper(m as any, ctx) as any).loadMemoryVariables({ q: 1 });
      expect(res).toEqual({ chat_history: ['m1'] });
      expect(m.loadMemoryVariables).toHaveBeenCalledWith({ q: 1 });
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiMemory, [
        [{ json: { action: 'loadMemoryVariables', values: { q: 1 } } }],
      ]);
      expect(outputOf()[2]).toEqual([[{ json: { action: 'loadMemoryVariables', chatHistory: ['m1'] } }]]);
    });

    it('wraps saveContext', async () => {
      const m = memory();
      await (logWrapper(m as any, ctx) as any).saveContext({ i: 1 }, { o: 2 });
      expect(m.saveContext).toHaveBeenCalledWith({ i: 1 }, { o: 2 });
      expect(outputOf()[2]).toEqual([[{ json: { action: 'saveContext', chatHistory: ['m1', 'm2'] } }]]);
    });
  });

  describe('chat message history', () => {
    const history = () => ({
      getMessages: jest.fn(async () => ['a']),
      addMessage: jest.fn(async () => undefined),
    });

    it('wraps getMessages', async () => {
      const h = history();
      expect(await (logWrapper(h as any, ctx) as any).getMessages()).toEqual(['a']);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-messages-retrieved-from-memory', expect.any(String));
      expect(outputOf()[2]).toEqual([[{ json: { action: 'getMessages', response: ['a'] } }]]);
    });

    it('wraps addMessage', async () => {
      const h = history();
      await (logWrapper(h as any, ctx) as any).addMessage('msg');
      expect(h.addMessage).toHaveBeenCalledWith('msg');
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-message-added-to-memory', expect.any(String));
    });
  });

  describe('retriever', () => {
    class TestRetriever extends BaseRetriever {
      lc_namespace = ['test'];
      override async _getRelevantDocuments() {
        return [];
      }
      override getRelevantDocuments = jest.fn(async () => [
        { pageContent: 'p', metadata: { executionId: 'e', workflowId: 'w' } },
      ]) as any;
    }

    it('wraps getRelevantDocuments and forwards sub execution metadata', async () => {
      const r = new TestRetriever();
      const res = await (logWrapper(r, ctx) as any).getRelevantDocuments('q', { cfg: 1 });
      expect(res).toHaveLength(1);
      expect(r.getRelevantDocuments).toHaveBeenCalledWith('q', { cfg: 1 });
      expect(outputOf()[3]).toEqual({ subExecution: { executionId: 'e', workflowId: 'w' } });
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-documents-retrieved', expect.any(String));
    });
  });

  describe('embeddings', () => {
    class TestEmbeddings extends Embeddings {
      embedDocuments = jest.fn(async (docs: string[]) => docs.map(() => [1]));
      embedQuery = jest.fn(async () => [2]);
      constructor() {
        super({});
      }
    }

    it('wraps embedDocuments and embedQuery', async () => {
      const e = new TestEmbeddings();
      const w: any = logWrapper(e, ctx);
      expect(await w.embedDocuments(['a', 'b'])).toEqual([[1], [1]]);
      expect(await w.embedQuery('q')).toEqual([2]);
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiEmbedding, [[{ json: { documents: ['a', 'b'] } }]]);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-document-embedded', undefined);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-query-embedded', undefined);
    });

    it('records errors and rethrows', async () => {
      const e = new TestEmbeddings();
      e.embedQuery.mockRejectedValue(new Error('down'));
      await expect((logWrapper(e, ctx) as any).embedQuery('q')).rejects.toThrow('down');
      expect(outputOf()[2]).toBeInstanceOf(NodeOperationError);
    });
  });

  describe('loaders', () => {
    it('wraps processAll and processItem of the json loader', async () => {
      const loader = new N8nJsonLoader({ getNodeParameter: jest.fn() } as any);
      jest.spyOn(loader, 'processAll').mockResolvedValue([{ pageContent: 'a', metadata: {} }]);
      jest.spyOn(loader, 'processItem').mockResolvedValue([{ pageContent: 'b', metadata: {} }]);
      const w: any = logWrapper(loader, ctx);
      expect(await w.processAll([{ json: {} }])).toEqual([{ pageContent: 'a', metadata: {} }]);
      expect(await w.processItem({ json: {} }, 3)).toEqual([{ pageContent: 'b', metadata: {} }]);
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiDocument, [[{ json: {} }]]);
      expect(outputOf(1)[2][0][0].pairedItem).toEqual({ item: 3 });
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-document-processed', undefined);
    });

    it('wraps the binary loader too', async () => {
      const loader = new N8nBinaryLoader({ getNodeParameter: jest.fn() } as any);
      jest.spyOn(loader, 'processAll').mockResolvedValue([]);
      await (logWrapper(loader, ctx) as any).processAll([]);
      expect(ctx.addOutputData).toHaveBeenCalled();
    });
  });

  describe('text splitter', () => {
    class TestSplitter extends TextSplitter {
      splitText = jest.fn(async (t: string) => t.split(' '));
      constructor() {
        super();
      }
    }

    it('wraps splitText', async () => {
      const s = new TestSplitter();
      expect(await (logWrapper(s, ctx) as any).splitText('a b')).toEqual(['a', 'b']);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-text-split', undefined);
    });
  });

  describe('tool', () => {
    it('wraps _call', async () => {
      const tool: any = { lc_namespace: ['langchain', 'tools'], _call: jest.fn(async () => 'result') };
      expect(await (logWrapper(tool, ctx) as any)._call('q')).toBe('result');
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-tool-called', expect.stringContaining('result'));
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiTool, [[{ json: { query: 'q' } }]]);
    });
  });

  describe('vector store', () => {
    class TestStore extends VectorStore {
      _vectorstoreType() {
        return 'test';
      }
      addVectors = jest.fn();
      addDocuments = jest.fn();
      similaritySearchVectorWithScore = jest.fn();
      override similaritySearch = jest.fn(async () => [{ pageContent: 'hit', metadata: {} }]) as any;
      constructor() {
        super({} as any, {});
      }
    }

    it('wraps similaritySearch', async () => {
      const s = new TestStore();
      const res = await (logWrapper(s, ctx) as any).similaritySearch('q', 3, { f: 1 });
      expect(res).toEqual([{ pageContent: 'hit', metadata: {} }]);
      expect(s.similaritySearch).toHaveBeenCalledWith('q', 3, { f: 1 }, undefined);
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiVectorStore, [
        [{ json: { query: 'q', k: 3, filter: { f: 1 } } }],
      ]);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-vector-store-searched', expect.any(String));
    });
  });
});
