jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));

import {
  addProjectConfiguration,
  readJson,
  readNxJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './init/generator';
import nodeGenerator from './node/generator';
import triggerGenerator from './trigger/generator';

function setup(): Tree {
  const tree = createTreeWithEmptyWorkspace();
  writeJson(tree, 'package.json', { name: 'root', dependencies: { 'n8n-workflow': '^1.0.0' } });
  addProjectConfiguration(tree, 'nodes', {
    root: 'libs/nodes',
    sourceRoot: 'libs/nodes/src',
    projectType: 'library',
    tags: [ 'n8n' ],
    targets: { build: { executor: '@nx/js:tsc', options: {} } },
  });
  writeJson(tree, 'libs/nodes/package.json', { name: '@scope/nodes', version: '0.0.1' });
  return tree;
}

describe('plugin-n8n generators', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  describe('init', () => {
    it('registers plugin and configures n8n project', async () => {
      const tree = setup();
      addProjectConfiguration(tree, 'other', { root: 'libs/other', projectType: 'library', targets: {} });
      await initGenerator(tree, { skipFormat: true });
      expect(JSON.stringify(readNxJson(tree))).toContain('@rxap/plugin-n8n');
      const pkg = readJson(tree, 'libs/nodes/package.json');
      expect(pkg.n8n).toEqual({ n8nNodesApiVersion: 1, nodes: [], credentials: [] });
      expect(pkg.keywords).toContain('n8n-community-node-package');
      expect(pkg.peerDependencies['n8n-workflow']).toBe('^1.0.0');
      const project = readProjectConfiguration(tree, 'nodes');
      expect(project.tags).toContain('n8n');
      expect(JSON.stringify(project.targets?.['build'])).toContain('**/*.(svg|json|png)');
    });

    it('accepts an explicit project', async () => {
      const tree = setup();
      await initGenerator(tree, { project: 'nodes', skipFormat: true });
      expect(readJson(tree, 'libs/nodes/package.json').n8n).toBeDefined();
    });

    it('formats files by default', async () => {
      const tree = setup();
      await initGenerator(tree, { skipProjects: true });
      expect(tree.exists('nx.json')).toBe(true);
    });
  });

  describe('node', () => {
    it('creates node files and registers in package.json', async () => {
      const tree = setup();
      await nodeGenerator(tree, { project: 'nodes', name: 'my-node', description: 'desc' });
      const json = readJson(tree, 'libs/nodes/src/lib/MyNode/MyNode.node.json');
      expect(json.node).toBe('n8n-nodes-base.rxapMyNode');
      expect(json.alias).toEqual([ 'MyNode', 'my', 'node' ]);
      const files = tree.listChanges().map(c => c.path);
      expect(files.some(f => f.endsWith('MyNode.node.ts'))).toBe(true);
      const src = tree.read(files.find(f => f.endsWith('MyNode.node.ts'))!, 'utf-8')!;
      expect(src).toContain('class MyNode implements INodeType');
      expect(src).toContain("'rxapMyNode'");
      expect(readJson(tree, 'libs/nodes/package.json').n8n.nodes).toEqual([ 'src/lib/MyNode/MyNode.node.js' ]);
    });
  });

  describe('trigger', () => {
    it('creates trigger files and registers in package.json', async () => {
      const tree = setup();
      await triggerGenerator(tree, { project: 'nodes', name: 'my-event', nodeNamePrefix: 'acme' } as any);
      const files = tree.listChanges().map(c => c.path);
      const ts = files.find(f => f.endsWith('MyEventTrigger.node.ts'))!;
      expect(ts).toBeDefined();
      expect(tree.read(ts, 'utf-8')).toContain("'acmeMyEventTrigger'");
      expect(files.some(f => f.endsWith('.node.json'))).toBe(true);
      expect(readJson(tree, 'libs/nodes/package.json').n8n.nodes).toEqual([ 'src/lib/MyEvent/MyEventTrigger.node.js' ]);
    });
  });
});
