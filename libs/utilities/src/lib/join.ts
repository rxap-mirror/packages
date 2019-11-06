export function joinPath(...fragments: string[]) {
  return fragments.filter(Boolean).join('/');
}
