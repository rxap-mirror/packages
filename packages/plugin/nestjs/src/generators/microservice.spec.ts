import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

jest.mock('@nx/nest', () => ({ applicationGenerator: jest.fn(async () => undefined) }));
jest.mock('./init-application/generator', () => ({ __esModule: true, default: jest.fn(async () => undefined) }));
jest.mock('./microservice/generator', () => ({ __esModule: true, default: jest.fn(async () => undefined) }));

import { applicationGenerator } from '@nx/nest';
import featureMicroserviceGenerator from './feature-microservice/generator';
import frontendMicroserviceGenerator from './frontend-microservice/generator';
import initApplicationGenerator from './init-application/generator';

describe('plugin-nestjs microservice generators', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('microservice', () => {
    const { microserviceGenerator } = jest.requireActual('./microservice/generator');

    it('throws without nx.json', async () => {
      tree.delete('nx.json');
      await expect(microserviceGenerator(tree, { name: 'x' })).rejects.toThrow('No nx.json found');
    });

    it('generates the nest application and runs the init generator', async () => {
      await microserviceGenerator(tree, { name: 'billing' });
      expect(applicationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({
        name: 'service-billing',
        directory: 'service/billing',
        tags: 'nest,service',
      }));
      expect(initApplicationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({
        project: 'service-billing',
        generateMain: true,
      }));
    });

    it('merges preset tags and honors a directory', async () => {
      const nxJson = readNxJson(tree)!;
      nxJson.generators = { '@nx/nest:application': { tags: 'a, nest' } };
      updateNxJson(tree, nxJson);
      await microserviceGenerator(tree, { name: 'service-x', directory: 'custom/x' });
      expect(applicationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({
        name: 'service-x',
        directory: 'custom/x',
        tags: 'a,nest,service',
      }));
    });
  });

  describe('feature-microservice / frontend-microservice', () => {
    const microservice = jest.requireMock('./microservice/generator').default as jest.Mock;

    it('feature throws without nx.json', async () => {
      tree.delete('nx.json');
      await expect(featureMicroserviceGenerator(tree, { feature: 'f' } as any)).rejects.toThrow('No nx.json');
    });

    it('feature derives the name, directory and api prefix', async () => {
      await featureMicroserviceGenerator(tree, { feature: 'orders' } as any);
      expect(microservice).toHaveBeenCalledWith(tree, expect.objectContaining({
        name: 'service-feature-orders',
        directory: 'service/feature/orders',
        apiPrefix: 'api/feature/orders',
      }));
    });

    it('frontend throws without nx.json', async () => {
      tree.delete('nx.json');
      await expect(frontendMicroserviceGenerator(tree, { frontend: 'a', feature: 'f' } as any)).rejects.toThrow('No nx.json');
    });

    it('frontend derives the name, directory and api prefix', async () => {
      await frontendMicroserviceGenerator(tree, { frontend: 'user-interface-shop', feature: 'cart' } as any);
      expect(microservice).toHaveBeenCalledWith(tree, expect.objectContaining({
        name: 'service-app-shop-cart',
        directory: 'service/app/shop/cart',
        apiPrefix: 'api/app/shop/cart',
      }));
    });
  });
});
