export function NormalizeTag(tag: string) {
  return tag.replace(/[^a-zA-Z0-9_\-.]/g, '-').toLowerCase();
}
