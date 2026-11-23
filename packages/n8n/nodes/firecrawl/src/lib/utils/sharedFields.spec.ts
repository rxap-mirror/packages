import { NodeConnectionTypes } from 'n8n-workflow';
import { getConnectionHintNoticeField } from './sharedFields';

describe('getConnectionHintNoticeField', () => {
  it('renders a single connection with the correct article', () => {
    const field = getConnectionHintNoticeField([NodeConnectionTypes.AiAgent]);
    expect(field).toMatchObject({ name: 'notice', type: 'notice' });
    expect(field.displayName).toContain('must be connected to an AI agent');
    expect(field.displayName).toContain("data-action-parameter-creatorview='AI'");
  });

  it('uses "a" for consonants and the connection type parameter', () => {
    const field = getConnectionHintNoticeField([NodeConnectionTypes.AiVectorStore]);
    expect(field.displayName).toContain('a vector store');
    expect(field.displayName).toContain(`data-action-parameter-connectiontype='${NodeConnectionTypes.AiVectorStore}'`);
  });

  it('joins multiple connections with links', () => {
    const field = getConnectionHintNoticeField([NodeConnectionTypes.AiDocument, NodeConnectionTypes.AiRetriever]);
    expect(field.displayName).toContain('needs to be connected to');
    expect(field.displayName).toContain('Document Loader');
    expect(field.displayName).toContain(' or ');
  });

  it('groups locales of the same connection (root AI view)', () => {
    const field = getConnectionHintNoticeField([NodeConnectionTypes.AiAgent, NodeConnectionTypes.AiChain]);
    // both share the root AI view connection, so only one link is rendered
    expect(field.displayName.match(/<a /g)).toHaveLength(1);
  });
});
