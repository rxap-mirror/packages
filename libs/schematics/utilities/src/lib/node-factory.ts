import { WithTemplate } from './with-template';

export function NodeFactory(
  tag: string,
  ...attributes: Array<string | (() => string)>
): (innerNode?: Array<Partial<WithTemplate> | string> | string) => string {
  return (innerNode?: Array<Partial<WithTemplate> | string> | string) => {
    let template = `<${tag}`;
    attributes.forEach(attr => {
      if (typeof attr === 'string') {
        template += ' ' + attr;
      } else {
        template += ' ' + attr();
      }
    });
    template += '>';
    let innerText = '';
    if (typeof innerNode === 'string') {
      innerText += innerNode;
    } else {
      innerNode?.forEach(inner => {
        if (typeof inner === 'string') {
          innerText += inner;
        } else if (inner.template) {
          if (typeof inner.template === 'function') {
            innerText += inner.template();
          } else if (typeof inner.template === 'string') {
            innerText += inner.template;
          }
        }
      });
    }
    if (innerText.includes('\n')) {
      template += '\n';
    }
    template += innerText;
    template += `</${tag}>\n`;
    return template;
  };
}
