import { OpenWebUI } from './OpenWebUI.node';

describe('OpenWebUI node', () => {
  const node = new OpenWebUI();

  it('requires the openWebUIAuth credential', () => {
    expect(node.description.credentials).toEqual([
      { name: 'openWebUIAuth', displayName: 'Open WebUI Auth', required: true },
    ]);
    expect(node.description.displayName).toBe('Open Web UI');
  });

  it('generates properties from the openapi spec', () => {
    expect(node.description.properties.length).toBeGreaterThan(1);
  });

  it('uses a hidden base url parameter', () => {
    expect(node.buildBaseUrlParameters()).toEqual([
      { name: 'baseUrl', type: 'hidden', default: 'http://open-webui:8080' },
    ]);
  });
});
