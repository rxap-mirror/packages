// Run with: yarn test:scripts
//
// release.mjs is an orchestration script (nx, git, npm), so it is not executed here. These tests pin the
// ORDER of its phases in the source, because the order is what keeps a failed build/guard from leaving tags
// behind (regression: the release was aborted by the ng-prism guard AFTER the tags had been created and pushed).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  const build = indexOf('--configuration=production');
  const guard = indexOf('check-dist-for-ng-prism.mjs');
  const tag = indexOf('const untagged = tagReleases(changelogResult.projectChangelogs);');
  const publish = indexOf("await publishGroup(releasePublish, 'packages'", tag);

  it('creates the release commit first, then builds, guards, tags and publishes', () => {
    assert.ok(commit < build, 'build must run after the release commit (dist carries the bumped version)');
    assert.ok(build < guard, 'the guard checks the built dist');
    assert.ok(guard < tag, 'tags must only be created AFTER the dist guard passed');
    assert.ok(tag < publish, 'tags must exist before the publish');
  });

  it('does not tag before the build in the packages flow', () => {
    // the only tagReleases(...) call before the build would be the old position (right after the commit)
    const beforeBuild = source.slice(commit, build);
    assert.ok(!beforeBuild.includes('tagReleases('), 'tagReleases must not run between the release commit and the build');
  });

  it('does not push on abort before the tags exist, and says how to recover', () => {
    const die = source.slice(indexOf('const die = (msg) => {'), indexOf('// per-project failures after the release commit'));
    assert.match(die, /unreleasedCommit/, 'die() must know about the untagged release commit');
    assert.match(die, /git reset --hard HEAD~1/, 'die() must print the recovery command');
    assert.ok(die.indexOf('unreleasedCommit') < die.indexOf('git push --follow-tags'), 'the untagged case is handled before the push');
  });

  it('only arms the push-on-abort once the release commit is tagged', () => {
    const arm = indexOf('releaseCommitted = !DRY_RUN;');
    assert.ok(arm > tag && arm < publish, 'releaseCommitted must be set right after tagging');
    assert.equal(source.split('releaseCommitted = !DRY_RUN;').length - 1, 1, 'releaseCommitted must be armed in exactly one place');
  });
});
