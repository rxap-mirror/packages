import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import runExecutor from './executor';

describe('ci-info executor', () => {

  let root: string;
  let context: ExecutorContext;
  const envKeys = [
    'CI_COMMIT_TIMESTAMP', 'CI_COMMIT_BRANCH', 'CI_COMMIT_TAG', 'CI_COMMIT_SHA', 'CI_ENVIRONMENT_NAME',
    'CI_JOB_ID', 'CI_PIPELINE_ID', 'CI_PROJECT_ID', 'CI_RUNNER_ID', 'CI_ENVIRONMENT_URL', 'CI_ENVIRONMENT_TIER',
    'CI_ENVIRONMENT_SLUG', 'CI_COMMIT_REF_SLUG',
  ];
  const saved: Record<string, string | undefined> = {};

  function node(type: string, build = true) {
    return { type, name: 'x', data: { root: 'x', targets: build ? { build: { executor: 'e' } } : {} } };
  }

  beforeEach(() => {
    for (const key of envKeys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    root = mkdtempSync(join(tmpdir(), 'ci-info-'));
    // flat output of app, nested (directory only) output of lib
    mkdirSync(join(root, 'dist/app'), { recursive: true });
    writeFileSync(join(root, 'dist/app/index.html'), '');
    mkdirSync(join(root, 'dist/lib/browser'), { recursive: true });
    mkdirSync(join(root, 'dist/lib/server'), { recursive: true });
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'ws',
      projectsConfigurations: {
        version: 2,
        projects: {
          app: { root: 'apps/app', targets: { build: { executor: 'e', options: { outputPath: join(root, 'dist/app') } } } },
          lib: { root: 'libs/lib', targets: { build: { executor: 'e', options: { outputPath: join(root, 'dist/lib') } } } },
          missing: { root: 'libs/missing', targets: { build: { executor: 'e', options: { outputPath: join(root, 'dist/missing') } } } },
        },
      },
      projectGraph: {
        nodes: {
          app: node('app'),
          lib: node('lib'),
          missing: node('lib'),
          e2e: node('e2e'),
          nobuild: node('lib', false),
        },
        dependencies: {},
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should write build.json for every built project', async () => {
    Object.assign(process.env, {
      CI_COMMIT_TIMESTAMP: 't', CI_COMMIT_BRANCH: 'main', CI_COMMIT_TAG: 'v1', CI_COMMIT_SHA: 'sha', CI_ENVIRONMENT_NAME: 'n',
      CI_JOB_ID: '1', CI_PIPELINE_ID: '2', CI_PROJECT_ID: '3', CI_RUNNER_ID: '4', CI_ENVIRONMENT_URL: 'u',
      CI_ENVIRONMENT_TIER: 'production', CI_ENVIRONMENT_SLUG: 's', CI_COMMIT_REF_SLUG: 'ref',
    });
    const result = await runExecutor({}, context);
    expect(result).toEqual({ success: true });
    const content = JSON.parse(readFileSync(join(root, 'dist/app/build.json'), 'utf-8'));
    expect(content).toEqual(expect.objectContaining({
      timestamp: 't', branch: 'main', tag: 'v1', commit: 'sha', name: 'n', job: '1', pipeline: '2', project: '3', runner: '4',
      url: 'u', tier: 'production', slug: { name: 's', tag: 'ref', branch: 'ref' },
    }));
    expect(existsSync(join(root, 'dist/lib/build.json'))).toBe(true);
    expect(existsSync(join(root, 'dist/lib/browser/build.json'))).toBe(true);
    expect(existsSync(join(root, 'dist/lib/server/build.json'))).toBe(true);
    expect(existsSync(join(root, 'dist/missing'))).toBe(false);
  });

  it('should use a generated timestamp and explicit options', async () => {
    await runExecutor({ branch: 'explicit' }, context);
    const content = JSON.parse(readFileSync(join(root, 'dist/app/build.json'), 'utf-8'));
    expect(content.branch).toBe('explicit');
    expect(content.timestamp).toBeDefined();
  });

  it('should work without a project graph', async () => {
    delete (context as any).projectGraph;
    expect(await runExecutor({}, context)).toEqual({ success: true });
  });

});
