import { FlatTreeControl } from '@angular/cdk/tree';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { faker } from '@faker-js/faker';
import { RXAP_DATA_SOURCE_METADATA } from '@rxap/data-source';
import { Node } from '@rxap/data-structure-tree';
import { ToMethod } from '@rxap/pattern';
import {
  RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD,
  TreeDataSource,
} from '@rxap/tree';
import { clone } from '@rxap/utilities';

interface Data {
  id: string;
  name: string;
  value: number;
  hasChildren?: boolean;
  children?: Data[];
}

function randomData(children?: Data[], depth = 0, maxDepth = 5): Data {
  const hasChildren = children?.length ? true : (
    children?.length === 0 ? false : (
      depth === maxDepth ? false : faker.datatype.boolean()
    )
  );
  if (hasChildren && !children) {
    children = Array.from({ length: faker.number.int(10) }, () => randomData(undefined, depth + 1, maxDepth));
  }
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    value: faker.number.int(),
    children,
    hasChildren,
  };
}

describe(TreeDataSource.name, () => {

  describe('cached selection restore', () => {

    const treeData = randomData([
      randomData([ randomData() ]),
      randomData([
        randomData(),
        randomData(),
        randomData(),
      ]),
      randomData([ randomData() ]),
    ]);

    const treeControl = new FlatTreeControl((node: Node<Data>) => node.depth, (node: Node<Data>) => node.hasChildren);

    let treeDataSource: TreeDataSource;

    beforeEach(() => {

      const getRootMethod = ToMethod(() => clone(treeData));

      TestBed.configureTestingModule({
        providers: [
          TreeDataSource,
          {
            provide: RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD,
            useValue: getRootMethod,
          },
          {
            provide: RXAP_DATA_SOURCE_METADATA,
            useValue: {},
          },
        ],
      });

      treeDataSource = TestBed.inject(TreeDataSource);
      treeDataSource.setTreeControl(treeControl);

    });

    it('should restore nothing if no selection is cached', fakeAsync(() => {

      const subscribe = jest.fn();
      treeDataSource.connect({ id: 'test' }).subscribe(subscribe);
      tick();

      // expect(subscribe).toBeCalledWith(treeData);

    }));

  });

});
