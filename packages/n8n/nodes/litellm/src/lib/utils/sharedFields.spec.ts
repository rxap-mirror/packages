import { NodeConnectionType } from 'n8n-workflow';
import { getConnectionHintNoticeField } from './sharedFields';

describe('getConnectionHintNoticeField', () => {
  it('returns a notice property', () => {
    const f = getConnectionHintNoticeField([NodeConnectionType.AiChain]);
    expect(f.name).toBe('notice');
    expect(f.type).toBe('notice');
    expect(f.typeOptions).toEqual({ containerClass: 'ndv-connection-hint-notice' });
  });

  it('single connection group uses a/an and the creator view', () => {
    const f = getConnectionHintNoticeField([NodeConnectionType.AiAgent, NodeConnectionType.AiChain]);
    // both map to the root AI view -> one group, first locale used
    expect(f.displayName).toBe(
      "This node must be connected to an AI agent. <a data-action='openSelectiveNodeCreator' data-action-parameter-creatorview='AI'>Insert one</a>",
    );
  });

  it('single non-root connection', () => {
    const f = getConnectionHintNoticeField([NodeConnectionType.AiDocument]);
    expect(f.displayName).toContain('a document loader');
    expect(f.displayName).toContain(`data-action-parameter-connectiontype='${NodeConnectionType.AiDocument}'`);
  });

  it('multiple groups produce links joined with "or"', () => {
    const f = getConnectionHintNoticeField([
      NodeConnectionType.AiChain,
      NodeConnectionType.AiAgent,
      NodeConnectionType.AiVectorStore,
    ]);
    expect(f.displayName).toMatch(/^This node needs to be connected to /);
    expect(f.displayName).toContain('an AI Chain or AI Agent</a>');
    expect(f.displayName).toContain('a Vector Store</a>');
    expect(f.displayName).toContain('</a> or <a');
  });
});
