// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyChanges, changedGroups } from './align-framework-group.mjs';
import { createResolver, DAY, pinnedVersions } from './lib/cooldown.mjs';
import { groupById, newestGroupVersion, onLine, packageGroupOf, planGroup, rootDeps } from './lib/framework-groups.mjs';

const NOW = Date.parse('2026-11-25T00:00:00Z');
const ago = days => new Date(NOW - days * DAY).toISOString();

/** registry doc from { version: { age, meta } } */
function doc(versions, latest) {
  return {
    'dist-tags': { latest: latest ?? Object.keys(versions).at(-1) },
    versions: Object.fromEntries(Object.entries(versions).map(([ v, m ]) => [ v, { version: v, ...(m.meta ?? {}) } ])),
    time: Object.fromEntries(Object.entries(versions).map(([ v, m ]) => [ v, ago(m.age) ])),
  };
}

const ngGroup = [ '@angular/core', '@angular/common', '@angular/compiler' ];
const ng = (age, extra = {}) => ({ age, meta: { 'ng-update': { packageGroup: ngGroup }, ...extra } });

function context(pkg, docs) {
  const resolver = createResolver({
    workspaceVersions: pinnedVersions(pkg),
    getDoc: name => docs[name] ?? null,
    weeklyDownloads: async () => 5_000_000, // 7-day tier
    now: () => NOW,
  });
  return { resolver, ctx: { deps: rootDeps(pkg), getDoc: resolver.doc, weeklyDownloads: async () => 5_000_000, resolver, now: NOW } };
}

const pkg = {
  dependencies: { '@angular/core': '22.3.0', '@angular/common': '22.3.0', '@angular/cdk': '22.3.0', '@angular/material': '22.3.0' },
  devDependencies: { '@angular/compiler': '22.3.0', '@angular/cli': '22.3.0', '@angular-devkit/core': '22.3.0', '@nx/angular': '24.0.6' },
};
const matGroup = { 'ng-update': { packageGroup: [ '@angular/material', '@angular/cdk' ] } };
const cliGroup = v => ({ 'ng-update': { packageGroup: { '@angular/cli': v, '@angular-devkit/core': v, '@angular-devkit/architect': `0.${ v.replace(/\./g, '0').slice(0, 4) }.0` } } });

function angularDocs({ commonAge = 20, cliAge = 20, nxPeer = '>= 20.0.0 < 23.0.0' } = {}) {
  return {
    '@angular/core': doc({ '22.3.0': ng(30), '22.3.2': ng(20), '23.0.0': ng(15), '23.0.1': ng(1) }),
    '@angular/common': doc({ '22.3.0': ng(30), '22.3.2': ng(commonAge), '23.0.0': ng(15) }),
    '@angular/compiler': doc({ '22.3.0': ng(30), '22.3.2': ng(20), '23.0.0': ng(15) }),
    '@angular/material': doc({ '22.3.0': { age: 30, meta: matGroup }, '22.3.1': { age: 20, meta: matGroup }, '23.0.0': { age: 15, meta: matGroup } }),
    '@angular/cdk': doc({ '22.3.0': { age: 30, meta: matGroup }, '22.3.1': { age: 20, meta: matGroup }, '23.0.0': { age: 15, meta: matGroup } }),
    '@angular/cli': doc({ '22.3.0': { age: 30, meta: cliGroup('22.3.0') }, '22.3.2': { age: cliAge, meta: cliGroup('22.3.2') }, '23.0.0': { age: 15, meta: cliGroup('23.0.0') } }),
    '@angular-devkit/core': doc({ '22.3.0': { age: 30 }, '22.3.2': { age: cliAge }, '23.0.0': { age: 15 } }),
    '@nx/angular': doc({ '24.0.6': { age: 30, meta: { peerDependencies: { '@angular-devkit/core': nxPeer } } } }),
  };
}

describe('framework groups', () => {
  it('reads packageGroups as arrays and maps', () => {
    assert.deepEqual(packageGroupOf({ 'ng-update': { packageGroup: [ 'a', 'b' ] } }, 'ng-update'), { a: null, b: null });
    assert.deepEqual(packageGroupOf({ 'ng-update': { packageGroup: { a: '1.0.0', b: '0.2203.0' } } }, 'ng-update'), { a: '1.0.0', b: '0.2203.0' });
    assert.deepEqual(packageGroupOf({ 'nx-migrations': { packageGroup: [ '@nx/js', { package: 'nx-cloud', version: 'latest' } ] } }, 'nx-migrations'), { '@nx/js': null });
    assert.ok(onLine('22.3.5', '22.3.0', 'minor') && !onLine('22.4.0', '22.3.0', 'minor') && onLine('22.4.0', '22.3.0', 'major'));
  });

  it('moves the lockstep members and followers together', async () => {
    const { resolver, ctx } = context(pkg, angularDocs());
    await resolver.preload(Object.keys(ctx.deps));
    const plan = await planGroup(groupById('angular'), '22.3.2', ctx);
    assert.equal(plan.ok, true, plan.pending.join('; '));
    assert.deepEqual(plan.changes.map(c => `${ c.name }@${ c.to }`), [
      '@angular-devkit/core@22.3.2', '@angular/cdk@22.3.1', '@angular/cli@22.3.2', '@angular/common@22.3.2', '@angular/compiler@22.3.2', '@angular/core@22.3.2', '@angular/material@22.3.1',
    ]);
  });

  it('keeps the whole group pending when one member is too young', async () => {
    const { resolver, ctx } = context(pkg, angularDocs({ commonAge: 2 }));
    await resolver.preload(Object.keys(ctx.deps));
    const plan = await planGroup(groupById('angular'), '22.3.2', ctx);
    assert.equal(plan.ok, false);
    assert.match(plan.pending[0], /^@angular\/common@22\.3\.2 is 2\.0d old < 7d/);
  });

  it('falls back to an older follower whose own group is eligible', async () => {
    const { resolver, ctx } = context(pkg, angularDocs({ cliAge: 2 }));
    await resolver.preload(Object.keys(ctx.deps));
    const plan = await planGroup(groupById('angular'), '22.3.2', ctx);
    assert.equal(plan.ok, true, plan.pending.join('; '));
    assert.ok(!plan.changes.some(c => c.name === '@angular/cli'));
  });

  it('picks the newest eligible group version and lets Angular 23 wait for the Nx peer range', async () => {
    const { resolver, ctx } = context(pkg, angularDocs());
    await resolver.preload(Object.keys(ctx.deps));
    const res = await newestGroupVersion(groupById('angular'), ctx);
    assert.equal(res.target, '22.3.2');
    assert.match(res.pending[0].reasons[0], /23\.0\.1 is younger than 7d/);
    assert.ok(res.pending[1].reasons.some(r => r.includes('@nx/angular@24.0.6 needs @angular-devkit/core')));

    const open = context(pkg, angularDocs({ nxPeer: '>= 20.0.0 < 24.0.0' }));
    await open.resolver.preload(Object.keys(open.ctx.deps));
    assert.equal((await newestGroupVersion(groupById('angular'), open.ctx)).target, '23.0.0');
  });

  it('does not block on peer conflicts that already exist', async () => {
    const nestPkg = { dependencies: { '@nestjs/core': '12.6.0', '@nestjs/common': '12.6.0' }, devDependencies: { '@nx/nest': '24.0.6' } };
    const nest = v => ({ age: 20, meta: { version: v } });
    const docs = {
      '@nestjs/core': doc({ '12.6.0': nest(), '12.6.1': nest() }),
      '@nestjs/common': doc({ '12.6.0': nest(), '12.6.1': nest() }),
      '@nx/nest': doc({ '24.0.6': { age: 30, meta: { peerDependencies: { '@nestjs/core': '>=10.0.0 <12.0.0' } } } }),
    };
    const { resolver, ctx } = context(nestPkg, docs);
    await resolver.preload(Object.keys(ctx.deps));
    const res = await newestGroupVersion(groupById('nestjs'), ctx);
    assert.equal(res.target, '12.6.1');
  });

  it('finds the groups a migration changed and writes exact versions', () => {
    const before = { dependencies: { '@angular/core': '22.3.0', '@nestjs/core': '12.6.0' }, devDependencies: { nx: '24.0.6' } };
    const after = { dependencies: { '@angular/core': '22.3.0', '@nestjs/core': '12.6.0' }, devDependencies: { nx: '24.1.0' } };
    assert.deepEqual(changedGroups([ groupById('nx'), groupById('angular'), groupById('nestjs') ], before, after).map(g => g.id), [ 'nx' ]);
    const out = applyChanges(structuredClone(after), [ { name: 'nx', section: 'devDependencies', to: '24.1.1' } ]);
    assert.equal(out.devDependencies.nx, '24.1.1');
  });
});
