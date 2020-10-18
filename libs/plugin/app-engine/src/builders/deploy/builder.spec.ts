import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { join } from 'path';
import { AppEngineDeployBuilderSchema } from './schema';
import { GCloud } from './gcloud';
import { Nx } from './nx';
import { CopyFile } from './copy-file';

describe('Command Runner Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let options: AppEngineDeployBuilderSchema;
  const outputPath: string = 'dist/test';
  const indexFile: string  = 'dist/test/index.html';
  const deploySpy          = jest.spyOn(GCloud.prototype, 'deploy');
  const buildSpy           = jest.spyOn(Nx.prototype, 'build');
  const syncSpy            = jest.spyOn(CopyFile.prototype, 'sync');

  beforeEach(async () => {
    options        = { project: 'test' };
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost('/root', '/root');
    architect     = new Architect(architectHost, registry);

    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage(join(__dirname, '../../..'));

    architectHost.addTarget({ project: 'test', target: 'deploy' }, '@rxap/plugin-app-engine:deploy', options);
    architectHost.addTarget({ project: 'test', target: 'build' }, 'angular', { outputPath, index: indexFile });

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('can run', async () => {

    deploySpy.mockResolvedValue(true);
    buildSpy.mockResolvedValue(true);
    syncSpy.mockReturnValue();

    // A "run" can have multiple outputs, and contains progress information.
    const run    = await architect.scheduleTarget(
      { project: 'test', target: 'deploy' }
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

  it('should fail if build fails', async () => {

    const error = new Error('failed build');

    deploySpy.mockResolvedValue(true);
    buildSpy.mockRejectedValue(error);
    syncSpy.mockReturnValue();

    // A "run" can have multiple outputs, and contains progress information.
    const run    = await architect.scheduleTarget(
      { project: 'test', target: 'deploy' }
    );
    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();

    // Expect that it succeeded.
    expect(output.success).toBe(false);
    expect(output.error).toBe(error.message);

  });

  it('should fail if deploy fails', async () => {

    const error = new Error('failed deploy');

    deploySpy.mockRejectedValue(error);
    buildSpy.mockResolvedValue(true);
    syncSpy.mockReturnValue();

    // A "run" can have multiple outputs, and contains progress information.
    const run    = await architect.scheduleTarget(
      { project: 'test', target: 'deploy' }
    );
    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();

    // Expect that it succeeded.
    expect(output.success).toBe(false);
    expect(output.error).toBe(error.message);

  });

  it('should skip build target if --skip-build flag is used', async () => {

    deploySpy.mockResolvedValue(true);
    buildSpy.mockResolvedValue(true);
    syncSpy.mockReturnValue();

    // A "run" can have multiple outputs, and contains progress information.
    const run    = await architect.scheduleTarget(
      { project: 'test', target: 'deploy' },
      { skipBuild: true }
    );
    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();

    // Expect that it succeeded.
    expect(output.success).toBe(true);
    expect(deploySpy).toBeCalled();
    expect(buildSpy).not.toBeCalled();
    expect(syncSpy).toBeCalled();

  });

});
