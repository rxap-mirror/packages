import { Gitlab } from './Gitlab.node';
import { GitlabTool } from './GitlabTool.node';

describe.each([
  ['Gitlab', Gitlab],
  ['GitlabTool', GitlabTool],
])('%s node', (_name, Ctor: any) => {
  const node = new Ctor();

  it('requires the gitlabApi credential', () => {
    expect(node.description.credentials).toEqual([{ name: 'gitlabApi', required: true }]);
    expect(node.description.displayName).toContain('GitLab API');
  });

  it('generates properties from the openapi spec', () => {
    expect(node.description.properties.length).toBeGreaterThan(1);
  });

  it('overrides the base url parameter', () => {
    expect(node.buildBaseUrlParameters()).toEqual([
      { name: 'baseUrl', type: 'string', default: 'https://gitlab.com' },
    ]);
  });
});
