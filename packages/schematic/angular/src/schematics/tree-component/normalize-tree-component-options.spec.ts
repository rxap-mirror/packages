import { NormalizeTreeComponentOptions } from './normalize-tree-component-options';
import { TreeComponentOptions } from './schema';

describe('NormalizeTreeComponentOptions', () => {
  it('should normalize minimal tree component options', () => {
    const options: TreeComponentOptions = {
      name: 'test-tree',
      project: 'ui-lib',
    };
    expect(NormalizeTreeComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex tree component options', () => {
    const options: TreeComponentOptions = {
      name: 'file-explorer',
      project: 'ui-lib',
      fullTree: false,
      modifiers: [ 'drag-drop' ],
      controllerName: 'ExplorerController',
    };
    expect(NormalizeTreeComponentOptions(options)).toMatchSnapshot();
  });
});
