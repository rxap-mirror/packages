import {
  Architect,
  BuilderContext
} from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { join } from 'path';
import { LibrarySchematicsBuilderSchema } from './schema';
import { CopyFiles } from './copy-files';
import { Glob } from './glob';
import { MockBuilderContext } from '@nrwl/workspace/testing';
import { Builder } from './builder';
import { ReadFile } from './read-file';

describe('@rxap-plugin/library-schematics', () => {

  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let options: LibrarySchematicsBuilderSchema;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost('/root', '/root');
    architect     = new Architect(architectHost, registry);

    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage(join(__dirname, '../../..'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Command Runner Builder', () => {

    const copyFileSyncSpy = jest.spyOn(CopyFiles.prototype, 'sync');
    const globSyncSpy     = jest.spyOn(Glob.prototype, 'sync');
    const readFileSpySpy  = jest.spyOn(ReadFile.prototype, 'sync');
    let getProjectMetadata: jest.SpyInstance;

    beforeEach(() => {
      options = { buildTarget: 'test:build', skipBuild: true, tsConfig: 'tsconfig.schematics.json' };
      architectHost.addTarget({ project: 'test', target: 'schematics' }, '@rxap-plugin/library-schematics:build', options);
      architectHost.addTarget({ project: 'test', target: 'build' }, 'angular', { outputPath: 'path', project: 'libs/test/ng-package.json' });
      getProjectMetadata = jest.spyOn(architectHost, 'getProjectMetadata').mockResolvedValue({ root: 'app' });
    });

    it('can run', async () => {

      copyFileSyncSpy.mockReturnValue();
      globSyncSpy.mockReturnValue([]);
      readFileSpySpy.mockReturnValue('{ "dest": "dist/libs/test" }');

      // A "run" can have multiple outputs, and contains progress information.
      const run    = await architect.scheduleTarget(
        { project: 'test', target: 'schematics' }
      );
      // The "result" member (of type BuilderOutput) is the next output.
      const output = await run.result;

      // Stop the builder from running. This stops Architect from keeping
      // the builder-associated states in memory, since builders keep waiting
      // to be scheduled.
      await run.stop();

      // Expect that it succeeded.
      expect(output.success).toBe(true);
    });

  });

  describe('Builder', () => {

    let context: MockBuilderContext;
    let builder: Builder;

    beforeEach(() => {
      context = new MockBuilderContext(architect, architectHost);
    });

    it('copyCollectionJson', () => {

      options = { buildTarget: 'test:build', tsConfig: 'tsconfig.schematics.json' };
      builder = new Builder(options, context as BuilderContext);

      const copyFileSyncSpy = jest.spyOn(builder.copyFile, 'sync');
      const processCwd      = jest.spyOn(process, 'cwd');
      const root            = 'libs/lib';
      const outputPath      = 'dist/libs/lib';

      copyFileSyncSpy.mockReturnValue();

      processCwd.mockReturnValue('/home/user/projects/app');

      builder.copyCollectionJson(root, outputPath);

      expect(copyFileSyncSpy).toBeCalledTimes(1);
      expect(copyFileSyncSpy).nthCalledWith(
        1,
        '/home/user/projects/app/libs/lib/schematics/collection.json',
        '/home/user/projects/app/dist/libs/lib/schematics/collection.json'
      );

    });

  });

});
