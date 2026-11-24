// Keeps a rebuilt library linkable: gives the new file the ids of the previous one.
//
// A file that links a FigCraft library remembers it by the library id and each copied asset by its id in the
// library file: component sets, variants and every layer inside them by node id, variables, collections, modes
// and styles by their string ids. A build starts from an empty file, so every id would be new: linked files then
// report "the file now holds another library" and get no updates. Before publishing, `keepIds` therefore
// - matches the new file's nodes to the previous file's (by `pluginData.prismKey` where a node has one, else by
//   type and name, else by type and order under the matched parent) and renumbers them to the old ids,
// - matches collections, modes, variables and styles by name and renames them to the old ids,
// - carries over the previous published library (`library/` in the zip), so `library.publish` keeps the library
//   id and gives a new version only to the assets that changed.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function unpack(file) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'figcraft-ids-'));
  execFileSync('unzip', ['-q', path.resolve(file), '-d', dir]);
  return dir;
}

function pack(dir, file) {
  const tmp = path.resolve(`${file}.ids.tmp`);
  fs.rmSync(tmp, { force: true });
  // document.json first, the way FigCraft writes it.
  const rest = fs.readdirSync(dir).filter((e) => e !== 'document.json');
  execFileSync('zip', ['-q', '-X', '-D', '-r', tmp, 'document.json', ...rest], {
    cwd: dir,
  });
  fs.renameSync(tmp, path.resolve(file));
}

const readDoc = (dir) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'document.json'), 'utf8'));
const keyOf = (n) => n.plugin_data?.prismKey;

/** new node id -> old node id */
function matchNodes(prev, next) {
  const map = new Map();
  const used = new Set();
  const take = (n, o) => {
    map.set(n.id, o.id);
    used.add(o.id);
  };
  const byKey = new Map();
  for (const o of Object.values(prev.nodes))
    if (keyOf(o)) byKey.set(keyOf(o), o);

  const walk = (nId, oId) => {
    const n = next.nodes[nId];
    const o = oId === undefined ? undefined : prev.nodes[oId];
    const kids = n.children ?? [];
    const free = (o?.children ?? [])
      .map((id) => prev.nodes[id])
      .filter((c) => c && !used.has(c.id));
    const pick = (pred) => {
      const i = free.findIndex(pred);
      return i < 0 ? undefined : free.splice(i, 1)[0];
    };
    const pairs = new Map();
    // 1. prismKey anywhere in the old file (a component may move to another page or section).
    for (const id of kids) {
      const c = next.nodes[id];
      const o2 = keyOf(c) && byKey.get(keyOf(c));
      if (o2 && !used.has(o2.id) && o2.type === c.type) {
        pairs.set(id, o2);
        take(c, o2);
        const k = free.indexOf(o2);
        if (k >= 0) free.splice(k, 1);
      }
    }
    // 2. same type and name, 3. same type in order (a text layer whose label changed).
    for (const pass of [
      (c) => (o2) => o2.type === c.type && o2.name === c.name && !keyOf(o2),
      (c) => (o2) => o2.type === c.type && !keyOf(o2),
    ])
      for (const id of kids) {
        const c = next.nodes[id];
        if (pairs.has(id) || keyOf(c)) continue;
        const o2 = pick(pass(c));
        if (o2) {
          pairs.set(id, o2);
          take(c, o2);
        }
      }
    for (const id of kids) walk(id, pairs.get(id)?.id);
  };

  const oldPages = prev.pages.map((id) => prev.nodes[id]);
  for (const id of next.pages) {
    const p = next.nodes[id];
    const o = oldPages.find((x) => x.name === p.name && !used.has(x.id));
    if (o) take(p, o);
    walk(id, o?.id);
  }
  return map;
}

/** new string id -> old string id for collections, modes, variables and styles */
function matchAssets(prev, next) {
  const map = new Map();
  const num = (ids, re) =>
    Math.max(0, ...ids.map((i) => Number(String(i).match(re)?.[1] ?? 0)));
  let nextColl =
    num(
      prev.variables.collections.map((c) => c.id),
      /:(\d+)$/,
    ) + 1;
  let nextVar =
    num(
      prev.variables.variables.map((v) => v.id),
      /:(\d+)$/,
    ) + 1;
  let nextStyle =
    num(
      prev.styles.map((s) => s.id),
      /:(\d+)$/,
    ) + 1;
  const taken = new Set([
    ...prev.variables.collections.map((c) => c.id),
    ...prev.variables.variables.map((v) => v.id),
    ...prev.styles.map((s) => s.id),
  ]);
  const fresh = (prefix, counter) => {
    let id;
    do id = `${prefix}${counter()}`;
    while (taken.has(id));
    taken.add(id);
    return id;
  };

  // Copies from a linked library (`<library id>:VariableID:28`, `<library id>:S:2`) carry the library's own ids:
  // they are the same in every build and must not be renumbered into this file's ids.
  const linked = (id) => /^[0-9a-f]{8,}:/.test(String(id));
  const oldColl = new Map(prev.variables.collections.map((c) => [c.name, c]));
  for (const c of next.variables.collections) {
    if (linked(c.id)) continue;
    const o = oldColl.get(c.name);
    const id = o ? o.id : fresh('VariableCollectionId:', () => nextColl++);
    map.set(c.id, id);
    const oldModes = new Map((o?.modes ?? []).map((m) => [m.name, m.id]));
    let k = 1;
    for (const m of c.modes) {
      let mid = oldModes.get(m.name);
      if (!mid || [...map.values()].includes(mid)) {
        do mid = `${id}/mode${k++}`;
        while (
          (o?.modes ?? []).some((x) => x.id === mid) ||
          [...map.values()].includes(mid)
        );
      }
      map.set(m.id, mid);
    }
  }
  const collName = new Map(
    next.variables.collections.map((c) => [c.id, c.name]),
  );
  const oldCollName = new Map(
    prev.variables.collections.map((c) => [c.id, c.name]),
  );
  const oldVar = new Map(
    prev.variables.variables.map((v) => [
      `${oldCollName.get(v.collection)}\u0000${v.name}`,
      v.id,
    ]),
  );
  for (const v of next.variables.variables.filter((x) => !linked(x.id)))
    map.set(
      v.id,
      oldVar.get(`${collName.get(v.collection)}\u0000${v.name}`) ??
        fresh('VariableID:', () => nextVar++),
    );
  const oldStyle = new Map(
    prev.styles.map((s) => [`${s.type}\u0000${s.name}`, s.id]),
  );
  for (const s of next.styles.filter((x) => !linked(x.id)))
    map.set(
      s.id,
      oldStyle.get(`${s.type}\u0000${s.name}`) ??
        fresh('S:', () => nextStyle++),
    );
  for (const [k, v] of map) if (k === v) map.delete(k);
  return map;
}

/** Renames string ids in values and object keys, leaving text content alone. */
function renameStrings(value, map) {
  if (typeof value === 'string') return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => renameStrings(v, map));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value))
      out[map.get(k) ?? k] = [
        'characters',
        'name',
        'description',
        'plugin_data',
        'dev_resources',
      ].includes(k)
        ? v
        : renameStrings(v, map);
    return out;
  }
  return value;
}

function renumber(doc, map) {
  const id = (i) => (i === undefined || i === null ? i : (map.get(i) ?? i));
  const ids = (list) => list?.map(id);
  const nodes = {};
  for (const n of Object.values(doc.nodes)) {
    const m = { ...n, id: id(n.id) };
    if ('parent' in n) m.parent = id(n.parent);
    if (n.children) m.children = ids(n.children);
    if ('source' in n) m.source = id(n.source);
    if ('component' in n) m.component = id(n.component);
    if (n.flows?.length)
      m.flows = n.flows.map((f) => ({ ...f, start: id(f.start) }));
    if (n.props && n.type !== 'instance')
      m.props = Object.fromEntries(
        Object.entries(n.props).map(([k, p]) => [
          k,
          p?.type === 'instanceSwap' || p?.type === 'slot'
            ? {
                ...p,
                ...('default' in p && { default: id(p.default) }),
                ...(p.preferred && { preferred: ids(p.preferred) }),
              }
            : p,
        ]),
      );
    nodes[m.id] = m;
  }
  doc.nodes = nodes;
  doc.pages = ids(doc.pages);
  doc.current_page = id(doc.current_page);
  doc.comments = (doc.comments ?? []).map((c) => ({
    ...c,
    page: id(c.page),
    ...('anchor' in c && { anchor: id(c.anchor) }),
  }));
}

/**
 * Rewrites `nextFile` with the ids of `prevFile` and the previous published library. Returns counts of what
 * kept its id and what is new.
 */
export function keepIds(prevFile, nextFile) {
  const prevDir = unpack(prevFile);
  const nextDir = unpack(nextFile);
  try {
    const prev = readDoc(prevDir);
    const next = readDoc(nextDir);
    const nodeMap = matchNodes(prev, next);
    // Nodes without a match get ids above everything the previous file (or its library) ever used.
    const libDoc = path.join(prevDir, 'library', 'document.json');
    const libMax = fs.existsSync(libDoc)
      ? Math.max(
          0,
          ...Object.keys(JSON.parse(fs.readFileSync(libDoc, 'utf8')).nodes).map(
            Number,
          ),
        )
      : 0;
    let counter = Math.max(
      prev.next_id ?? 0,
      libMax + 1,
      ...Object.keys(prev.nodes).map((k) => Number(k) + 1),
    );
    for (const k of Object.keys(next.nodes).map(Number))
      if (!nodeMap.has(k)) nodeMap.set(k, counter++);
    const swaps = new Map([...nodeMap].filter(([a, b]) => a !== b));
    renumber(next, swaps);
    next.next_id = Math.max(
      counter,
      ...Object.keys(next.nodes).map((k) => Number(k) + 1),
    );

    const assetMap = matchAssets(prev, next);
    next.variables = renameStrings(next.variables, assetMap);
    next.styles = renameStrings(next.styles, assetMap);
    for (const [k, n] of Object.entries(next.nodes))
      next.nodes[k] = renameStrings(n, assetMap);

    fs.writeFileSync(path.join(nextDir, 'document.json'), JSON.stringify(next));
    fs.rmSync(path.join(nextDir, 'library'), { recursive: true, force: true });
    if (fs.existsSync(path.join(prevDir, 'library')))
      fs.cpSync(path.join(prevDir, 'library'), path.join(nextDir, 'library'), {
        recursive: true,
      });
    pack(nextDir, nextFile);

    const oldIds = new Set(Object.keys(prev.nodes).map(Number));
    const kept = [...nodeMap.values()].filter((v) => oldIds.has(v)).length;
    const prevVars = new Set(
      [
        ...prev.variables.variables,
        ...prev.variables.collections,
        ...prev.styles,
      ].map((x) => x.id),
    );
    const nextVars = [
      ...next.variables.variables,
      ...next.variables.collections,
      ...next.styles,
    ].map((x) => x.id);
    return {
      nodes: { kept, new: nodeMap.size - kept, removed: oldIds.size - kept },
      assets: {
        kept: nextVars.filter((i) => prevVars.has(i)).length,
        new: nextVars.filter((i) => !prevVars.has(i)).length,
      },
    };
  } finally {
    fs.rmSync(prevDir, { recursive: true, force: true });
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
}
