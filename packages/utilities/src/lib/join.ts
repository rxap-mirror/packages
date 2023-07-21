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

export interface JoinWithOptions {
  strict?: boolean;
  removeDuplicated?: boolean;
}

export function joinWith(items: string[], separator = '-', options: JoinWithOptions = {}) {
  if (options.strict) {
    if (items.some(item => item === null || item === undefined || item === '')) {
      throw new Error('Invalid join items');
    }
  }
  if (options.removeDuplicated) {
    items = [ ...Array.from(new Set(items).values()) ];
  }
  return items.filter(item => item !== null && item !== undefined && item !== '').join(separator);
}

export function joinWithDash(items: string[], options: JoinWithOptions = {}) {
  return joinWith(items, '-', options);
}
