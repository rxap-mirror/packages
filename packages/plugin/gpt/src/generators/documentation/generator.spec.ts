import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CreateProject } from '@rxap/ts-morph';
import { TsMorphTransform } from '@rxap/workspace-ts-morph';
import { createOpenApi } from './open-ai-instance';
import { prompt } from './prompt';
import documentationGenerator from './generator';

jest.mock('./open-ai-instance', () => ({ createOpenApi: jest.fn() }));
jest.mock('./prompt', () => ({ prompt: jest.fn() }));
jest.mock('@rxap/workspace-ts-morph', () => ({ TsMorphTransform: jest.fn() }));

describe('documentation generator', () => {

  let tree: Tree;
  const savedEnv = { ...process.env };
  const promptMock = prompt as jest.Mock;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    delete process.env['OPENAI_API_KEY'];
    promptMock.mockReset().mockResolvedValue('/**\n * Doc\n */');
    (createOpenApi as jest.Mock).mockReset();
    (TsMorphTransform as jest.Mock).mockReset().mockImplementation(async (_tree: any, _path: string, cb: any) => {
      const project = CreateProject();
      project.createSourceFile('/a.ts', 'export function a() {}\nexport function b() {}');
      await cb(project);
      return project;
    });
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    jest.restoreAllMocks();
  });

  it('should throw without an api key', async () => {
    await expect(documentationGenerator(tree, {})).rejects.toThrow('OPENAI_API_KEY');
  });

  it('should prompt for every function', async () => {
    process.env['OPENAI_ORG_ID'] = 'org';
    await documentationGenerator(tree, { openaiApiKey: 'key', offline: true });
    expect(createOpenApi).toHaveBeenCalledWith({ apiKey: 'key', organization: 'org', project: undefined });
    expect(promptMock).toHaveBeenCalledTimes(2);
  });

  it('should read the api key from the environment and survive prompt errors', async () => {
    process.env['OPENAI_API_KEY'] = 'envkey';
    promptMock.mockRejectedValue(new Error('boom'));
    await documentationGenerator(tree, {});
    expect(createOpenApi).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'envkey' }));
  });

});
