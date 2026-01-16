import { AccordionItemKinds } from '@rxap/schematic-angular';
import { NormalizeAccordionItemDataGridComponentOptions } from './normalize-accordion-item-data-grid-component-options';
import { AccordionItemDataGridComponentOptions } from './schema';

describe('NormalizeAccordionItemDataGridComponentOptions', () => {
  it('should normalize minimal accordion item data grid component options', () => {
    const options: AccordionItemDataGridComponentOptions = {
      name: 'test-adg',
      title: 'jest',
      modifiers: [],
      project: 'ui-lib',
      kind: AccordionItemKinds.DataGrid,
      accordionName: 'parent',
      dataGrid: {
        itemList: [],
      },
    };
    expect(NormalizeAccordionItemDataGridComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion item data grid component options', () => {
    const options: AccordionItemDataGridComponentOptions = {
      name: 'users',
      project: 'ui-lib',
      title: 'jest',
      modifiers: [],
      kind: AccordionItemKinds.DataGrid,
      accordionName: 'management',
      dataGrid: {
        itemList: [
          { name: 'name' },
          { name: 'email' },
        ],
      },
    };
    expect(NormalizeAccordionItemDataGridComponentOptions(options)).toMatchSnapshot();
  });
});
