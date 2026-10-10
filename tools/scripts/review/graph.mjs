/**
 * Nx project graph helpers for the review orchestrator.
 *
 * Only `static` edges are used: the `implicit` edges in this workspace are aggregate/meta
 * dependencies (`rxap`, `angular`, `schematic-composer`, ...) that would turn umbrella projects
 * into hubs and destroy the leaf-first order. Only projects whose root starts with the root prefix
 * (default `packages/`, see --root-prefix) are selectable; dependencies outside it are kept so a
 * reviewer still gets their (earlier) reports as context, but they never constrain the order.
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_ROOT_PREFIX = 'packages/';

/** Exports the Nx graph and returns `{ projects: Map<name, {name, root, tags, targets}>, deps: Map<name, string[]> }`. */
export function loadGraph() {
  const dir = mkdtempSync(join(tmpdir(), 'rxap-review-graph-'));
  const file = join(dir, 'graph.json');
  try {
    try {
      execSync(`yarn nx graph --file=${file}`, { stdio: 'pipe' });
    } catch (e) {
      process.stderr.write(e.stderr ?? '');
      throw new Error('nx graph failed');
    }
    const { graph } = JSON.parse(readFileSync(file, 'utf8'));
    const projects = new Map();
    for (const node of Object.values(graph.nodes)) {
      const root = node.data.root ?? '';
      projects.set(node.name, {
        name: node.name,
        root,
        tags: node.data.tags ?? [],
        targets: Object.keys(node.data.targets ?? {}),
      });
    }
    const deps = new Map();
    for (const name of projects.keys()) {
      const edges = graph.dependencies[name] ?? [];
      const targets = edges
        .filter((e) => e.type === 'static' && e.target !== name && projects.has(e.target))
        .map((e) => e.target);
      deps.set(name, [...new Set(targets)].sort());
    }
    return { projects, deps };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Applies the selection flags.
 * @param {{rootPrefix: string, tags: string[], match: 'all'|'any', projects: string[], exclude: string[], withDeps: boolean}} opts
 * @returns {Set<string>}
 */
export function selectProjects({ projects, deps }, opts) {
  const inPrefix = (name) => projects.get(name)?.root.startsWith(opts.rootPrefix);
  const unknown = [...opts.projects, ...opts.exclude].filter((p) => !inPrefix(p));
  if (unknown.length) {
    throw new Error(`unknown project(s) or root outside "${opts.rootPrefix}": ${unknown.join(', ')}`);
  }
  const selected = new Set();
  for (const p of projects.values()) {
    if (!inPrefix(p.name)) {
      continue;
    }
    if (opts.projects.length && !opts.projects.includes(p.name)) {
      continue;
    }
    if (opts.tags.length) {
      const hit = opts.match === 'any'
        ? opts.tags.some((t) => p.tags.includes(t))
        : opts.tags.every((t) => p.tags.includes(t));
      if (!hit) {
        continue;
      }
    }
    selected.add(p.name);
  }
  if (opts.withDeps) {
    const queue = [...selected];
    while (queue.length) {
      for (const d of deps.get(queue.pop()) ?? []) {
        if (!selected.has(d) && inPrefix(d)) {
          selected.add(d);
          queue.push(d);
        }
      }
    }
  }
  for (const e of opts.exclude) {
    selected.delete(e);
  }
  return selected;
}

/**
 * Groups the selection into levels (Kahn's algorithm). Level 0 holds the leaves; every project's
 * selected dependencies are in a lower level. Dependencies outside the selection don't constrain
 * the order.
 * @returns {string[][]}
 */
export function computeLevels(selected, deps) {
  const remaining = new Map([...selected].map((p) => [p, (deps.get(p) ?? []).filter((d) => selected.has(d))]));
  const levels = [];
  const done = new Set();
  while (remaining.size) {
    const level = [...remaining]
      .filter(([, ds]) => ds.every((d) => done.has(d)))
      .map(([p]) => p)
      .sort();
    if (!level.length) {
      throw new Error(`dependency cycle among: ${[...remaining.keys()].join(', ')}`);
    }
    for (const p of level) {
      remaining.delete(p);
      done.add(p);
    }
    levels.push(level);
  }
  return levels;
}
