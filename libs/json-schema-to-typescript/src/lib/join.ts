export function joinPath(...fragments: Array<string | null | undefined>) {
  return fragments
    .filter(Boolean)
    .filter(fragment => !fragment!.match(/^\/+$/))
    .map(fragment => fragment!
      .replace(/\/+$/, '')
      .replace(/^\/+/, '')
    )
    .join('/')
    .replace(/\/+$/, '');
}
