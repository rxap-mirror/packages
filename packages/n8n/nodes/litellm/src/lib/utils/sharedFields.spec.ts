import { NodeConnectionTypes } from 'n8n-workflow';
import { getConnectionHintNoticeField } from './sharedFields';

describe('getConnectionHintNoticeField', () => {
  it('returns a notice property', () => {
    const f = getConnectionHintNoticeField([NodeConnectionTypes.AiChain]);
    expect(f.name).toBe('notice');
    expect(f.type).toBe('notice');
    expect(f.typeOptions).toEqual({ containerClass: 'ndv-connection-hint-notice' });
  });

  it('single connection group uses a/an and the creator view', () => {
    const f = getConnectionHintNoticeField([NodeConnectionTypes.AiAgent, NodeConnectionTypes.AiChain]);
    // both map to the root AI view -> one group, first locale used
    expect(f.displayName).toBe(
      "This node must be connected to an AI agent. <a data-action='openSelectiveNodeCreator' data-action-parameter-creatorview='AI'>Insert one</a>",
    );
  });

  it('single non-root connection', () => {
    const f = getConnectionHintNoticeField([NodeConnectionTypes.AiDocument]);
    expect(f.displayName).toContain('a document loader');
    expect(f.displayName).toContain(`data-action-parameter-connectiontype='${NodeConnectionTypes.AiDocument}'`);
  });

  it('multiple groups produce links joined with "or"', () => {
    const f = getConnectionHintNoticeField([
      NodeConnectionTypes.AiChain,
      NodeConnectionTypes.AiAgent,
      NodeConnectionTypes.AiVectorStore,
    ]);
    expect(f.displayName).toMatch(/^This node needs to be connected to /);
    expect(f.displayName).toContain('an AI Chain or AI Agent</a>');
    expect(f.displayName).toContain('a Vector Store</a>');
    expect(f.displayName).toContain('</a> or <a');
  });
});
