// Matching captured colours to the M3 system colour tokens.

/**
 * Aliases and palette helpers that share a value with a role; a role wins over them when both match.
 * (`background` = `surface`, `surface-tint` = `primary`, `surface-variant` = `surface-container-highest`, ...)
 */
const DEMOTED =
  /^(background|on-background|surface-tint|surface-variant|neutral\d+|neutral-variant\d+|shadow)$/;

/** Preferred roles per property when several tokens still match (e.g. text on a container). */
const ROLE_HINTS = {
  text: (n) => (n.startsWith('on-') ? 0 : 1),
  fill: (n) => (n.startsWith('on-') ? 1 : 0),
  stroke: (n) => (/outline/.test(n) ? 0 : 1),
};

export function tokenTable(theme) {
  const list = Object.keys(theme.light.colors)
    .filter((n) => theme.dark.colors[n])
    .map((name) => ({
      name,
      light: theme.light.colors[name],
      dark: theme.dark.colors[name],
    }))
    .filter((t) => t.light.a === 1 && t.dark.a === 1);
  return { list };
}

const same = (a, b) => a && b && a.r === b.r && a.g === b.g && a.b === b.b;

/**
 * The token whose light and dark value equal the colour (alpha is kept as paint opacity), or null.
 * Without a dark colour the light value alone must match exactly one role.
 */
export function matchToken(table, light, dark, role = 'fill') {
  if (!light) return null;
  let hits = table.list.filter(
    (t) => same(t.light, light) && (!dark || same(t.dark, dark)),
  );
  if (dark && Math.abs((dark.a ?? 1) - (light.a ?? 1)) > 0.02) hits = [];
  if (!hits.length) return null;
  const preferred = hits.filter((t) => !DEMOTED.test(t.name));
  const pool = preferred.length ? preferred : hits;
  if (!dark && pool.length > 1) {
    const hint = ROLE_HINTS[role] ?? (() => 0);
    pool.sort(
      (a, b) => hint(a.name) - hint(b.name) || a.name.localeCompare(b.name),
    );
    return pool[0].name;
  }
  const hint = ROLE_HINTS[role] ?? (() => 0);
  pool.sort(
    (a, b) => hint(a.name) - hint(b.name) || a.name.localeCompare(b.name),
  );
  return pool[0].name;
}
