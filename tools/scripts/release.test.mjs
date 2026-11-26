// Run with: pnpm test:scripts
//
// release.mjs is an orchestration script (nx, git, npm), so it is not executed here. These tests pin the
// ORDER of its phases in the source, because the order is what keeps a failed build/guard from leaving tags
// behind (regression: the release was aborted by the ng-prism guard AFTER the tags had been created and pushed).
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'release.mjs'), 'utf-8');

/** index of the first occurrence of `needle`, failing the test with a readable message when it is missing */
function indexOf(needle, from = 0) {
  const index = source.indexOf(needle, from);
  assert.notEqual(index, -1, `release.mjs no longer contains: ${needle}`);
  return index;
}

describe('release.mjs phase order (packages group)', () => {
  const commit = indexOf('await releaseChangelog({');
  const build = indexOf('buildDist(changed);');
  const guard = indexOf('applyDistTransforms({ projects: changed');
  const tag = indexOf('const untagged = tagReleases(changelogResult.projectChangelogs);');
  const push = indexOf('pushRelease(mode);', tag);
  const publish = indexOf("await publishGroup(releasePublish, 'packages'", tag);

  it('creates the release commit first, then builds, guards, tags, pushes and publishes', () => {
    assert.ok(commit < build, 'build must run after the release commit (dist carries the bumped version)');
    assert.ok(build < guard, 'the guard checks the built dist');
    assert.ok(guard < tag, 'tags must only be created AFTER the dist guard passed');
    assert.ok(tag < push, 'the push carries the tags');
    assert.ok(push < publish, 'nothing is published before the release commit and its tags are on the remote');
  });

  it('does not tag before the build in the packages flow', () => {
    const beforeBuild = source.slice(commit, build);
    assert.ok(!beforeBuild.includes('tagReleases('), 'tagReleases must not run between the release commit and the build');
  });

  it('pushes the umbrella commit before publishing the umbrella', () => {
    const umbrella = indexOf('async function releaseRxapUmbrella(');
    const umbrellaPush = indexOf('pushRelease(mode);', umbrella + 1);
    const umbrellaPublish = indexOf("await publishGroup(releasePublish, 'rxap', mode);", umbrella);
    assert.ok(umbrellaPush < umbrellaPublish);
  });

  it('never pushes on abort, says how to recover, and aborts when the push is rejected', () => {
    const die = source.slice(indexOf('const die = (msg) => {'), indexOf('// per-project failures after the release commit'));
    assert.match(die, /unpushedRelease/, 'die() must know about the unpushed release commit');
    assert.match(die, /git reset --hard origin\//, 'die() must print the recovery command');
    assert.ok(!die.includes('git push'), 'an abort must not push: the push only happens before the publish');
    const pushFn = source.slice(indexOf('function pushRelease(mode) {'), indexOf('async function publishGroup('));
    assert.match(pushFn, /die\(`git push/, 'a rejected push aborts the run (nothing published yet)');
    assert.match(pushFn, /unpushedRelease = false/);
  });

  it('packs instead of publishing with --pack, into a fresh folder with the publisher script', () => {
    const publishFn = source.slice(indexOf('async function publishGroup('), indexOf('function packGroup('));
    assert.match(publishFn, /if \(PACK_DIR\) \{\s+return packGroup\(/, '--pack must replace every publish');
    assert.ok(indexOf('preparePackDir();') < indexOf('if (PUBLISH_ONLY) {'), 'the pack folder is reset before any pack');
    assert.match(source, /copyFileSync\(join\('tools', 'scripts', 'publish-tarballs\.mjs'\)/);
  });

  it('pushes only this run\'s tags (no --follow-tags)', () => {
    assert.ok(!source.includes("'git push --follow-tags'"), 'a bare --follow-tags push needs an upstream and pushes stale local tags');
    assert.match(source, /createdTags\.push\(tag\)/);
  });
});

describe('lib/release-plan.mjs', () => {
  it('builds an atomic push of HEAD and exactly the given tags, with ci.skip', async () => {
    const { pushArgs } = await import('./lib/release-plan.mjs');
    assert.deepEqual(pushArgs({ branch: 'development', tags: ['@rxap/a@1.0.0', '@rxap/a@1.0.0'] }), [
      'push', '--atomic', '-o', 'ci.skip', 'origin', 'HEAD:refs/heads/development', 'refs/tags/@rxap/a@1.0.0:refs/tags/@rxap/a@1.0.0',
    ]);
    assert.deepEqual(pushArgs({ branch: 'latest', tags: [], pushOptions: [] }), ['push', '--atomic', 'origin', 'HEAD:refs/heads/latest']);
  });

  it('detects stamped majors and plans their dependents', async () => {
    const { withLatestTags, stampedPlan, isStamped } = await import('./lib/release-plan.mjs');
    const projects = withLatestTags(
      [
        { name: 'utilities', pkgName: '@rxap/utilities', disk: '22.0.0', deps: [] },
        { name: 'forms', pkgName: '@rxap/forms', disk: '21.0.3', deps: ['@rxap/utilities'] },
        { name: 'table', pkgName: '@rxap/table', disk: '21.0.1', deps: ['@rxap/forms'] },
        { name: 'other', pkgName: '@rxap/other', disk: '21.0.1', deps: [] },
        { name: 'rxap', pkgName: 'rxap', disk: '21.0.0', deps: [] },
      ],
      ['@rxap/utilities@21.0.4', '@rxap/utilities@21.0.5-dev.2', '@rxap/forms@21.0.3', '@rxap/table@21.0.1', '@rxap/other@21.0.1', 'rxap@21.0.0', 'foo'],
    );
    assert.equal(projects[0].latestTag, '21.0.5-dev.2');
    assert.deepEqual(projects.filter(isStamped).map((p) => p.name), ['utilities']);
    const plan = stampedPlan(projects, { isPrerelease: true, preid: 'dev' });
    assert.deepEqual([...plan.bySpecifier], [['22.0.0-dev.0', ['utilities']], ['prepatch', ['forms', 'table']]]);
    assert.deepEqual(plan.rest, ['other', 'rxap']);
    assert.deepEqual([...stampedPlan(projects, { isPrerelease: false }).bySpecifier][0], ['22.0.0', ['utilities']]);
  });

  it('recognises the commits release.mjs writes', async () => {
    const { isReleaseCommit } = await import('./lib/release-plan.mjs');
    assert.ok(isReleaseCommit('chore(release): version'));
    assert.ok(isReleaseCommit('chore(release): version rxap'));
    assert.ok(isReleaseCommit('fix(rxap): update package group'));
    assert.ok(!isReleaseCommit('fix(forms): version'));
  });
});

describe('dist-transforms.mjs', () => {
  function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'dist-transforms-'));
    const write = (dir, manifest, theme) => {
      mkdirSync(join(root, dir), { recursive: true });
      writeFileSync(join(root, dir, 'package.json'), JSON.stringify(manifest));
      if (theme) {
        writeFileSync(join(root, dir, 'theme.css'), '');
      }
    };
    write('dist/packages/angular/layout', { name: 'l', exports: { '.': './index.js' }, dependencies: { workspace: '*' } }, true);
    write('dist/packages/angular/icon', { name: 'i' });
    write('dist/packages/nest/gitlab', { name: 'g', peerDependencies: { workspace: '*', a: '1' } });
    return root;
  }
  const read = (root, dir) => JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8'));

  it('adds the theme export and strips the workspace marker in-process, then runs prism-strip and the guard', async () => {
    const { applyDistTransforms } = await import('./dist-transforms.mjs');
    const root = fixture();
    const commands = [];
    applyDistTransforms({ projects: ['a', 'b'], run: (cmd) => commands.push(cmd), root });
    assert.deepEqual(read(root, 'dist/packages/angular/layout'), {
      name: 'l', exports: { '.': './index.js', './theme': './theme.css' }, dependencies: {},
    });
    assert.deepEqual(read(root, 'dist/packages/angular/icon'), { name: 'i' });
    assert.deepEqual(read(root, 'dist/packages/nest/gitlab'), { name: 'g', peerDependencies: { a: '1' } });
    assert.equal(commands.length, 2);
    assert.match(commands[0], /--targets=prism-strip --projects=a,b /);
    assert.match(commands[1], /check-dist-for-ng-prism\.mjs --projects=a,b$/);
  });

  it('throws on a broken dist package.json instead of skipping it', async () => {
    const { stripWorkspaceMarker } = await import('./dist-transforms.mjs');
    const root = fixture();
    writeFileSync(join(root, 'dist/packages/nest/gitlab/package.json'), '{');
    assert.throws(() => stripWorkspaceMarker(root));
  });
});
