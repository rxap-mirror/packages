import { ExecutorContext } from '@nx/devkit';
import { indexExportGenerator } from '../../generators/index-export/generator';
import indexExport from './executor';

jest.mock('../../generators/index-export/generator', () => ({
  indexExportGenerator: jest.fn(async () => undefined),
}));

describe('index-export executor', () => {

  const generatorMock = indexExportGenerator as jest.Mock;

  beforeEach(() => {
    generatorMock.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should run the generator in-process for the current project', async () => {
    const context = { root: '/nonexistent-ws', projectName: 'lib' } as ExecutorContext;
    expect(await indexExport({ generateRootExport: true }, context)).toEqual({ success: true });
    expect(generatorMock).toHaveBeenCalledTimes(1);
    expect(generatorMock.mock.calls[0][1]).toEqual({ project: 'lib', generateRootExport: true });
  });

  it('should omit generateRootExport if not set', async () => {
    const context = { root: '/nonexistent-ws', projectName: 'lib' } as ExecutorContext;
    await indexExport({}, context);
    expect(generatorMock.mock.calls[0][1]).toEqual({ project: 'lib' });
  });

  it('should fail without a project name', async () => {
    expect(await indexExport({}, { root: '/ws' } as ExecutorContext)).toEqual({ success: false });
    expect(generatorMock).not.toHaveBeenCalled();
  });

});
