import { WithTemplate } from './with-template';

export function NodeFactory(tag: string, ...attributes: Array<string | (() => string)>): (innerNode?: Array<WithTemplate | string> | string) => string {
  return (innerNode?: Array<WithTemplate | string> | string) => {
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
      innerNode?.forEach(inner => innerText += typeof inner === 'string' ? inner : inner.template());
    }
    if (innerText.includes('\n')) {
      template += '\n';
    }
    template += innerText;
    template += `</${tag}>\n`;
    return template;
  };
}
