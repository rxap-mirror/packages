import { Neo4jBasicAuthCredentials } from './neo4j-basic-auth.credentials';
import * as api from '../index';

describe('Neo4jBasicAuthCredentials', () => {
  const cred = new Neo4jBasicAuthCredentials();

  it('has identifying metadata', () => {
    expect(cred.name).toBe('neo4j-basic-auth');
    expect(cred.displayName).toBe('Neo4j Basic Auth');
  });

  it('defines uri, user and password with defaults', () => {
    const byName = Object.fromEntries(cred.properties.map((p) => [p.name, p]));
    expect(Object.keys(byName)).toEqual(['uri', 'user', 'password']);
    expect(byName['uri'].default).toBe('neo4j://localhost');
    expect(byName['user'].default).toBe('neo4j');
    expect(byName['password'].typeOptions).toEqual({ password: true });
  });

  it('is exported from the package index', () => {
    expect(api.Neo4jBasicAuthCredentials).toBe(Neo4jBasicAuthCredentials);
  });
});
