import {RxapElement} from './element';

describe('XML Parser', () => {

  describe('Element', () => {

    it('should remove the xml namespace from nodeName', () => {

      const element0 = new RxapElement(document.createElement('element'));
      const element1 = new RxapElement(document.createElement('namespace:element'));

      expect(element0.name).toEqual(element1.name);

    });

    it('should return the node text content as trimmed string', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.getTextContent()).toEqual(undefined);
      expect(element.getTextContent('default')).toEqual('default');

      element.element.textContent = 'content';

      expect(element.getTextContent()).toEqual('content');

      element.element.textContent = '  spaced content  ';

      expect(element.getTextContent()).toEqual('spaced content');

      element.element.textContent = `
      spaced with n content
      `;

      expect(element.getTextContent()).toEqual('spaced with n content');

    });

    it('should detected if the element has children', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.hasChildren()).toBeFalsy();

      element.element.appendChild(document.createElement('child'));

      expect(element.hasChildren()).toBeTruthy();

      element.element.appendChild(document.createElement('child'));

      expect(element.hasChildren()).toBeTruthy();

    });

    it('should detected if the element has child with specified nodeName', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.hasChild('child-1')).toBeFalsy();
      expect(element.hasChild('child-2')).toBeFalsy();

      element.element.appendChild(document.createElement('child-1'));

      expect(element.hasChild('child-1')).toBeTruthy();
      expect(element.hasChild('child-2')).toBeFalsy();

      element.element.appendChild(document.createElement('child-2'));

      expect(element.hasChild('child-1')).toBeTruthy();
      expect(element.hasChild('child-2')).toBeTruthy();

    });

    it('should return all child nodes', () => {

      const element = new RxapElement(new DOMParser().parseFromString('<root><child-1/><child-2/></root>', 'text/xml').childNodes.item(0) as any);

      const children = element.getAllChildNodes();

      expect(children.length).toBe(2);
      expect(children[0].name).toEqual('child-1');
      expect(children[1].name).toEqual('child-2');

    });

    it('should return all child nodes with specified node names', () => {

      const element = new RxapElement(document.createElement('element'));

      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-2'));

      const children = element.getChildren('child-1');

      expect(children.length).toBe(3);

    });

    it('should return one child node with specified node names', () => {

      const element = new RxapElement(document.createElement('element'));

      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-2'));
      element.element.appendChild(document.createElement('child-1'));

      const child = element.getChild('child-2')!;

      expect(child).toBeDefined();
      expect(child.name).toEqual('child-2');
      expect(element.getChild('child-3')).not.toBeDefined();

    });

    it('should return specified child text content', () => {

      const element = new RxapElement(document.createElement('element'));

      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-1'));

      expect(element.getChildTextContent('child-2')).toEqual(undefined);

      const child = document.createElement('child-2');
      element.element.appendChild(child);
      element.element.appendChild(document.createElement('child-1'));

      expect(element.getChildTextContent('child-2')).toEqual(undefined);
      expect(element.getChildTextContent('child-2', 'my-content')).toEqual('my-content');

      child.textContent = 'content';

      expect(element.getChildTextContent('child-2')).toEqual('content');

      child.textContent = '  spaced content';

      expect(element.getChildTextContent('child-2')).toEqual('spaced content');

      child.textContent = '  { "username": "username-e" }  ';

      expect(element.getChildTextContent('child-2')).toEqual({'username': 'username-e'});

    });

    it('should return specified children text contents', () => {

      const element = new RxapElement(document.createElement('element'));

      element.element.appendChild(document.createElement('child-1'));
      element.element.appendChild(document.createElement('child-2'));

      expect(element.getChildTextContent('child-1')).toEqual(undefined);

      const child = document.createElement('child-1');
      element.element.appendChild(child);
      element.element.appendChild(document.createElement('child-1'));

      expect(element.getChildrenTextContent('child-1')).toEqual([undefined, undefined, undefined]);
      expect(element.getChildrenTextContent('child-1', 'my-content')).toEqual(['my-content', 'my-content', 'my-content']);

      child.textContent = 'content';

      expect(element.getChildrenTextContent('child-1')).toEqual([undefined, 'content', undefined]);
      expect(element.getChildrenTextContent('child-1', 'my-content')).toEqual(['my-content', 'content', 'my-content']);

      child.textContent = '  spaced content';

      expect(element.getChildrenTextContent('child-1')).toEqual([undefined, 'spaced content', undefined]);

      child.textContent = '  { "username": "username-e" }  ';

      expect(element.getChildrenTextContent('child-1')).toEqual([undefined, {'username': 'username-e'}, undefined]);

    });

    it('should detected if the element has an specified attribute', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.has('username')).toBeFalsy();

      element.element.setAttribute('username', 'my-username');

      expect(element.has('username')).toBeTruthy();

    });

    it('should return the element attribute as string', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.getString('username')).toEqual(undefined);
      expect(element.getString('username', 'mega-user')).toEqual('mega-user');

      element.element.setAttribute('username', 'my-username');

      expect(element.getString('username')).toEqual('my-username');

      element.element.setAttribute('username', 'true');

      expect(element.getString('username')).toEqual('true');

      element.element.setAttribute('username', '1');

      expect(element.getString('username')).toEqual('1');


    });

    it('should return the element attribute as number', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.getNumber('username')).toEqual(undefined);
      expect(element.getNumber('username', 42)).toEqual(42);

      element.element.setAttribute('username', '1');

      expect(element.getNumber('username')).toEqual(1);

      element.element.setAttribute('username', '0');

      expect(element.getNumber('username')).toEqual(0);

      element.element.setAttribute('username', '-1');

      expect(element.getNumber('username')).toEqual(-1);

      element.element.setAttribute('username', 'test');

      expect(element.getNumber('username')).toEqual(NaN);

    });

    it('should return the element attribute as boolean', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.getBoolean('username')).toEqual(undefined);
      expect(element.getBoolean('username', true)).toEqual(true);
      expect(element.getBoolean('username', false)).toEqual(false);
      expect(element.getBoolean('username', undefined)).toEqual(undefined);

      element.element.setAttribute('username', 'true');
      expect(element.getBoolean('username')).toEqual(true);

      element.element.setAttribute('username', '');
      expect(element.getBoolean('username')).toEqual(true);

      element.element.setAttribute('username', 'false');
      expect(element.getBoolean('username')).toEqual(false);

      element.element.setAttribute('username', '-1');
      expect(element.getBoolean('username')).toEqual(true);

      element.element.setAttribute('username', 'test');
      expect(element.getBoolean('username')).toEqual(true);

    });

    it('should auto detect attribute type', () => {

      const element = new RxapElement(document.createElement('element'));

      expect(element.get('username')).toEqual(undefined);
      expect(element.get('username', true)).toEqual(true);

      element.element.setAttribute('username', 'my-username');
      expect(element.get('username')).toEqual('my-username');

      element.element.setAttribute('username', 'true');
      expect(element.get('username')).toEqual(true);

      element.element.setAttribute('username', '"true"');
      expect(element.get('username')).toEqual('true');

      element.element.setAttribute('username', '"{ "username": true }"');
      expect(element.get('username')).toEqual('{ "username": true }');

      element.element.setAttribute('username', '{ "username": true }');
      expect(element.get('username')).toEqual({'username': true});

      element.element.setAttribute('username', '0');
      expect(element.get('username')).toEqual(0);

      element.element.setAttribute('username', '1');
      expect(element.get('username')).toEqual(1);

      element.element.setAttribute('username', '-1');
      expect(element.get('username')).toEqual(-1);

      element.element.setAttribute('username', '"-1"');
      expect(element.get('username')).toEqual('-1');

    });

  });

});
