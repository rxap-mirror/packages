export function LeafFactory(tag: string, ...attributes: Array<string | (() => string)>): string {
  let template = `<${tag}`;
  attributes.forEach(attr => {
    if (typeof attr === 'string') {
      template += ' ' + attr;
    } else {
      template += ' ' + attr();
    }
  });
  template += '/>\n';
  return template;
}
