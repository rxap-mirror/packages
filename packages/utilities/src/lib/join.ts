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
  removeEmpty?: boolean;
}

export function joinWith(items: Array<string | undefined | null>, separator = '-', options: JoinWithOptions = {}) {
  if (options.strict) {
    if (items.some(item => item === null || item === undefined || item === '')) {
      throw new Error('Invalid join items');
    }
  }
  if (options.removeDuplicated) {
    items = [ ...Array.from(new Set(items).values()) ];
  }
  if (options.removeEmpty) {
    items = items.filter(item => item !== null && item !== undefined && item !== '');
  }
  return items.filter(item => item !== null && item !== undefined && item !== '').join(separator);
}

export function joinWithDash(items: Array<string | undefined | null>, options: JoinWithOptions = {}) {
  return joinWith(items, '-', options);
}
