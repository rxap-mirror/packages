import { ExecutorContext } from '@nx/devkit';
import { YarnRun } from '@rxap/plugin-utilities';
import download from './download/executor';
import upload from './upload/executor';

jest.mock('@rxap/plugin-utilities', () => ({
  ...jest.requireActual('@rxap/plugin-utilities'),
  YarnRun: jest.fn(),
}));

describe('localazy executors', () => {

  const yarnRun = YarnRun as jest.Mock;
  const envKeys = [ 'LOCALAZY_WRITE_KEY', 'LOCALAZY_READ_KEY', 'LOCALAZY_KEY_MAP', 'CI', 'CI_COMMIT_REF_PROTECTED', 'CI_COMMIT_REF_SLUG' ];
  const saved: Record<string, string | undefined> = {};
  let downloadOptions: any;
  let context: ExecutorContext;

  beforeEach(() => {
    for (const key of envKeys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    yarnRun.mockReset().mockResolvedValue(undefined);
    downloadOptions = { readKey: 'r', writeKey: 'w' };
    context = {
      root: '/ws',
      projectName: 'app',
      projectsConfigurations: {
        version: 2,
        projects: { app: { root: 'apps/app', targets: { 'localazy-download': { executor: 'x', options: downloadOptions } } } },
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
    jest.restoreAllMocks();
  });

  describe('download', () => {

    it('should run localazy download with all options', async () => {
      const result = await download({
        readKey: 'r', writeKey: 'w', configJson: 'c.json', workingDirectory: 'wd', keysJson: 'k.json', tag: 'My Tag',
        dryRun: true, quite: true, force: true, branch: 'b', param: 'a:b', failOnMissingGroups: true,
      });
      expect(result).toEqual({ success: true });
      expect(yarnRun).toHaveBeenCalledWith([
        'localazy', 'download', '--read-key r', '--write-key w', '--config "c.json"', '--working-dir "wd"', '--keys "k.json"',
        '--tag my-tag', '--simulate', '--quiet', '--force', '--branch b', '--param a:b', '--failOnMissingGroups',
      ]);
    });

    it('should prefer keys from the environment', async () => {
      process.env['LOCALAZY_READ_KEY'] = 'er';
      process.env['LOCALAZY_WRITE_KEY'] = 'ew';
      await download({});
      expect(yarnRun).toHaveBeenCalledWith([ 'localazy', 'download', '--read-key er', '--write-key ew' ]);
    });

    it('should use the auto tag', async () => {
      process.env['CI_COMMIT_REF_PROTECTED'] = 'true';
      process.env['CI_COMMIT_REF_SLUG'] = 'main';
      await download({ autoTag: true });
      expect(yarnRun).toHaveBeenCalledWith([ 'localazy', 'download', '--tag main' ]);
      yarnRun.mockClear();
      delete process.env['CI_COMMIT_REF_PROTECTED'];
      await download({ autoTag: true });
      expect(yarnRun).toHaveBeenCalledWith([ 'localazy', 'download' ]);
    });

    it('should report failures', async () => {
      yarnRun.mockRejectedValue(new Error('boom'));
      expect(await download({})).toEqual({ success: false, error: 'boom' });
    });

  });

  describe('upload', () => {

    it('should take keys from the download target and run upload', async () => {
      const result = await upload({}, context);
      expect(result).toEqual({ success: true });
      expect(yarnRun).toHaveBeenCalledTimes(1);
      expect(yarnRun).toHaveBeenCalledWith([ 'localazy', 'upload', '--read-key r', '--write-key w' ]);
    });

    it('should pass all options and publish the tag', async () => {
      const result = await upload({
        configJson: 'c', workingDirectory: 'wd', keysJson: 'k', version: '1', dryRun: true, quite: true, force: true,
        branch: 'b', param: 'p:v', failOnMissingGroups: true, project: 'proj', async: true, disableContentLength: true,
        tag: 'My Tag',
      }, context);
      expect(result).toEqual({ success: true });
      expect(yarnRun.mock.calls[0][0]).toEqual([
        'localazy', 'upload', '--read-key r', '--write-key w', '--config "c"', '--working-dir "wd"', '--keys "k"',
        '--app-version 1', '--simulate', '--quiet', '--force', '--branch b', '--param p:v', '--failOnMissingGroups',
        '--project proj', '--async', '--disable-content-length',
      ]);
      expect(yarnRun.mock.calls[1][0]).toEqual([
        'localazy', 'tag', '--read-key r', '--write-key w', '--config "c"', '--working-dir "wd"', '--keys "k"', 'publish', 'my-tag',
      ]);
    });

    it('should use the auto tag', async () => {
      process.env['CI_COMMIT_REF_PROTECTED'] = 'true';
      process.env['CI_COMMIT_REF_SLUG'] = 'Main';
      await upload({ autoTag: true }, context);
      expect(yarnRun.mock.calls[1][0].slice(-2)).toEqual([ 'publish', 'main' ]);
      yarnRun.mockClear();
      delete process.env['CI_COMMIT_REF_SLUG'];
      await upload({ autoTag: true }, context);
      expect(yarnRun).toHaveBeenCalledTimes(1);
    });

    it('should prefer env keys', async () => {
      process.env['LOCALAZY_READ_KEY'] = 'er';
      process.env['LOCALAZY_WRITE_KEY'] = 'ew';
      await upload({}, context);
      expect(yarnRun.mock.calls[0][0]).toEqual([ 'localazy', 'upload', '--read-key er', '--write-key ew' ]);
    });

    it('should exit successfully without write key outside of CI', async () => {
      delete downloadOptions.writeKey;
      expect(await upload({}, context)).toEqual({ success: true });
      expect(yarnRun).not.toHaveBeenCalled();
    });

    it('should fail without write key in CI', async () => {
      delete downloadOptions.writeKey;
      process.env['CI'] = 'true';
      expect(await upload({}, context)).toEqual({ success: false, error: 'Could not find write key' });
    });

    it('should fail without read key', async () => {
      delete downloadOptions.readKey;
      expect(await upload({}, context)).toEqual({ success: false, error: 'Could not find read key' });
    });

    it('should report upload and tag failures', async () => {
      yarnRun.mockRejectedValueOnce(new Error('up'));
      expect(await upload({}, context)).toEqual({ success: false, error: 'up' });
      yarnRun.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('tag'));
      expect(await upload({ tag: 'x' }, context)).toEqual({ success: false, error: 'tag' });
    });

  });

});
