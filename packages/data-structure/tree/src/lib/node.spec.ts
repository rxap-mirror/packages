import {Node} from './node';

describe('@rxap/table-system', () => {

  describe('Node', () => {

    it('create node with children', () => {

      const onExpand = jest.fn();
      const onCollapse = jest.fn();

      const node = Node.ToNode(
        {
          id: 'node',
          children: [
            {id: 'child_0'},
            {id: 'child_1'},
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
        {
          id: 'node',
          children: [
            {id: 'child_0'},
            {id: 'child_1'},
          ],
        },
        0,
        onExpand,
        onCollapse,
      );

      const onExpand_Child = jest.fn();
      const onCollapse_Child = jest.fn();

      const child = Node.ToNode({id: 'new child', children: [] as any}, 0, onExpand_Child, onCollapse_Child);

      node.addChild(child);

      expect(node.children.length).toEqual(3);

      const addedChild = node.children[2];
      expect(addedChild).toBe(child);

      expect(child.onCollapse).toBe(node.onCollapse);
      expect(child.onExpand).toBe(node.onExpand);


    });

  });

});
