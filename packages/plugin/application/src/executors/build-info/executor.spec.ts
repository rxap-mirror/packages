import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import runExecutor from './executor';

describe('build-info executor', () => {

  let root: string;
  let context: ExecutorContext;
  const envKeys = [
    'CI_COMMIT_TIMESTAMP', 'CI_COMMIT_BRANCH', 'CI_COMMIT_TAG', 'CI_COMMIT_SHA', 'CI_ENVIRONMENT_NAME',
    'CI_JOB_ID', 'CI_PIPELINE_ID', 'CI_PROJECT_ID', 'CI_RUNNER_ID', 'CI_ENVIRONMENT_URL', 'CI_ENVIRONMENT_TIER',
    'CI_ENVIRONMENT_SLUG', 'CI_COMMIT_REF_SLUG',
  ];
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    root = mkdtempSync(join(tmpdir(), 'build-info-'));
    mkdirSync(join(root, 'apps/app/src'), { recursive: true });
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'app',
      projectsConfigurations: {
        version: 2,
        projects: { app: { root: 'apps/app', sourceRoot: 'apps/app/src' } },
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should write build.json with a timestamp', async () => {
    const result = await runExecutor({}, context);
    expect(result.success).toBe(true);
    const file = join(root, 'apps/app/src/build.json');
    expect(existsSync(file)).toBe(true);
    const content = JSON.parse(readFileSync(file, 'utf-8'));
    expect(content.timestamp).toBeDefined();
    expect(content.slug).toEqual({});
  });

  it('should take values from the CI environment', async () => {
    Object.assign(process.env, {
      CI_COMMIT_TIMESTAMP: '2020-01-01T00:00:00Z',
      CI_COMMIT_BRANCH: 'main',
      CI_COMMIT_TAG: 'v1',
      CI_COMMIT_SHA: 'abc',
      CI_ENVIRONMENT_NAME: 'prod',
      CI_JOB_ID: '1',
      CI_PIPELINE_ID: '2',
      CI_PROJECT_ID: '3',
      CI_RUNNER_ID: '4',
      CI_ENVIRONMENT_URL: 'https://example.com',
      CI_ENVIRONMENT_TIER: 'production',
      CI_ENVIRONMENT_SLUG: 'prod-slug',
      CI_COMMIT_REF_SLUG: 'ref-slug',
    });
    await runExecutor({}, context);
    const content = JSON.parse(readFileSync(join(root, 'apps/app/src/build.json'), 'utf-8'));
    expect(content).toEqual({
      timestamp: '2020-01-01T00:00:00Z',
      branch: 'main',
      tag: 'v1',
      commit: 'abc',
      name: 'prod',
      job: '1',
      pipeline: '2',
      project: '3',
      runner: '4',
      url: 'https://example.com',
      tier: 'production',
      slug: { name: 'prod-slug', tag: 'ref-slug', branch: 'ref-slug' },
    });
  });

  it('should prefer explicit options over the environment and overwrite existing file', async () => {
    process.env['CI_COMMIT_BRANCH'] = 'other';
    await runExecutor({ branch: 'explicit' }, context);
    const result = await runExecutor({ branch: 'explicit' }, context);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalled();
    const content = JSON.parse(readFileSync(join(root, 'apps/app/src/build.json'), 'utf-8'));
    expect(content.branch).toBe('explicit');
  });

});
