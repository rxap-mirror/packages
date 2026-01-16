import { AccordionItemKinds } from '@rxap/schematic-angular';
import { NormalizeAccordionItemTreeTableComponentOptions } from './normalize-accordion-item-tree-table-component-options';
import { AccordionItemTreeTableComponentOptions } from './schema';

describe('NormalizeAccordionItemTreeTableComponentOptions', () => {
  it('should normalize minimal accordion item tree table component options', () => {
    const options: AccordionItemTreeTableComponentOptions = {
      name: 'test-att',
      project: 'ui-lib',
      kind: AccordionItemKinds.TreeTable,
      title: 'jest',
      modifiers: [],
      accordionName: 'parent',
      table: {
        columnList: [ { name: 'col1' } ],
        actionList: [],
        propertyList: [],
        filterList: [],
      },
    };
    expect(NormalizeAccordionItemTreeTableComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion item tree table component options', () => {
    const options: AccordionItemTreeTableComponentOptions = {
      name: 'files',
      project: 'ui-lib',
      kind: AccordionItemKinds.TreeTable,
      title: 'jest',
      modifiers: [],
      accordionName: 'explorer',
      table: {
        columnList: [
          { name: 'name' },
          { name: 'size' },
        ],
        actionList: [],
        propertyList: [],
        filterList: [],
      },
    };
    expect(NormalizeAccordionItemTreeTableComponentOptions(options)).toMatchSnapshot();
  });
});
