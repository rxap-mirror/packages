import { NodeConnectionType } from 'n8n-workflow';
import { getConnectionHintNoticeField } from './sharedFields';

describe('getConnectionHintNoticeField', () => {
  it('renders a single connection with the correct article', () => {
    const field = getConnectionHintNoticeField([NodeConnectionType.AiAgent]);
    expect(field).toMatchObject({ name: 'notice', type: 'notice' });
    expect(field.displayName).toContain('must be connected to an AI agent');
    expect(field.displayName).toContain("data-action-parameter-creatorview='AI'");
  });

  it('uses "a" for consonants and the connection type parameter', () => {
    const field = getConnectionHintNoticeField([NodeConnectionType.AiVectorStore]);
    expect(field.displayName).toContain('a vector store');
    expect(field.displayName).toContain(`data-action-parameter-connectiontype='${NodeConnectionType.AiVectorStore}'`);
  });

  it('joins multiple connections with links', () => {
    const field = getConnectionHintNoticeField([NodeConnectionType.AiDocument, NodeConnectionType.AiRetriever]);
    expect(field.displayName).toContain('needs to be connected to');
    expect(field.displayName).toContain('Document Loader');
    expect(field.displayName).toContain(' or ');
  });

  it('groups locales of the same connection (root AI view)', () => {
    const field = getConnectionHintNoticeField([NodeConnectionType.AiAgent, NodeConnectionType.AiChain]);
    // both share the root AI view connection, so only one link is rendered
    expect(field.displayName.match(/<a /g)).toHaveLength(1);
  });
});
