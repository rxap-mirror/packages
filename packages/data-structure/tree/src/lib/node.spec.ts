import { Node } from './node';

describe('@rxap/table-system', () => {

  describe('Node', () => {

    it('create node with children', () => {

      const onExpand = jest.fn();
      const onCollapse = jest.fn();

      const node = Node.ToNode(
        null,
        {
          id: 'node',
          children: [
            { id: 'child_0' },
            { id: 'child_1' },
          ],
        },
        0,
        onExpand,
        onCollapse,
      );

      expect(node.children.length).toBe(2);
      expect(node.depth).toBe(0);

      for (const child of node.children) {
        expect(child.depth).toBe(1);
        expect(child.children.length).toBe(0);
        expect(child.onCollapse).toBe(node.onCollapse);
        expect(child.onExpand).toBe(node.onExpand);
      }

    });

    it('add child to node', () => {

      const onExpand = jest.fn();
      const onCollapse = jest.fn();

      const node = Node.ToNode(
        null,
        {
          id: 'node',
          children: [
            { id: 'child_0' },
            { id: 'child_1' },
          ],
        },
        0,
        onExpand,
        onCollapse,
      );

      const onExpand_Child = jest.fn();
      const onCollapse_Child = jest.fn();

      const child = Node.ToNode(null, {
        id: 'new child',
        children: [] as any,
      }, 0, onExpand_Child, onCollapse_Child);

      node.addChild(child);

      expect(node.children.length).toEqual(3);

      const addedChild = node.children[2];
      expect(addedChild).toBe(child);

      expect(child.onCollapse).toBe(node.onCollapse);
      expect(child.onExpand).toBe(node.onExpand);


    });

    function buildTree() {
      return Node.ToNode(
        null,
        {
          id: 'root',
          children: [
            { id: 'a', children: [ { id: 'a1' } ] },
            { id: 'b' },
          ],
        },
        0,
        jest.fn(),
        jest.fn(),
      );
    }

    describe('traversal', () => {

      it('forEachChild should visit only direct children', () => {
        const node = buildTree();
        const visited: string[] = [];
        node.forEachChild(child => visited.push(child.id));
        expect(visited).toEqual([ 'a', 'b' ]);
      });

      it('forEachDescendant should visit every descendant exactly once', () => {
        const node = buildTree();
        const visited: string[] = [];
        node.forEachDescendant(child => visited.push(child.id));
        expect(visited).toEqual([ 'a', 'a1', 'b' ]);
      });

    });

    describe('visibility', () => {

      it('isVisible should always be the inverse of isHidden', () => {
        const node = buildTree();
        const all = [ node ];
        node.forEachDescendant(child => all.push(child));
        for (const n of all) {
          expect(n.isVisible).toBe(!n.isHidden);
        }
        // hide a leaf and re-check the invariant across the tree
        node.getNode('a1')?.hide({ onlySelf: true });
        for (const n of all) {
          expect(n.isVisible).toBe(!n.isHidden);
        }
      });

      it('a node whose only child is hidden is itself hidden, not visible', () => {
        const node = buildTree();
        const a = node.getNode('a')!;
        node.getNode('a1')!.hide({ onlySelf: true });
        expect(a.isHidden).toBe(true);
        expect(a.isVisible).toBe(false);
      });

    });

    describe('hide/show propagation', () => {

      it('forEachChild hides only direct children', () => {
        const node = buildTree();
        node.hide({ forEachChild: true });
        expect(node.hidden).toBe(true);
        expect(node.getNode('a')!.hidden).toBe(true);
        expect(node.getNode('b')!.hidden).toBe(true);
        // grandchild must remain untouched
        expect(node.getNode('a1')!.hidden).toBe(false);
      });

      it('forEachChildren hides every descendant', () => {
        const node = buildTree();
        node.hide({ forEachChildren: true });
        expect(node.getNode('a')!.hidden).toBe(true);
        expect(node.getNode('a1')!.hidden).toBe(true);
        expect(node.getNode('b')!.hidden).toBe(true);
      });

      it('show with forEachChildren reveals every descendant', () => {
        const node = buildTree();
        node.hide({ forEachChildren: true });
        node.show({ forEachChildren: true });
        expect(node.hidden).toBe(false);
        expect(node.getNode('a')!.hidden).toBe(false);
        expect(node.getNode('a1')!.hidden).toBe(false);
      });

    });

  });

});
