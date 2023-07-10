export function JoinPath(...fragments: Array<string | null | undefined>) {
  return fragments
    .filter(Boolean)
    .filter(fragment => !fragment!.match(/^\/+$/))
    .map(fragment => fragment!
      .replace(/\/+$/, '')
      .replace(/^\/+/, ''),
    )
    .join('/')
    .replace(/\/+$/, '');
}

/**
 * @deprecated use JoinPath instead
 */
export const joinPath = JoinPath;
