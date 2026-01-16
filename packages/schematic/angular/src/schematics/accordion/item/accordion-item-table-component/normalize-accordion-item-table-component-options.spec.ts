import { AccordionItemKinds } from '@rxap/schematic-angular';
import { NormalizeAccordionItemTableComponentOptions } from './normalize-accordion-item-table-component-options';
import { AccordionItemTableComponentOptions } from './schema';

describe('NormalizeAccordionItemTableComponentOptions', () => {
  it('should normalize minimal accordion item table component options', () => {
    const options: AccordionItemTableComponentOptions = {
      name: 'test-at',
      project: 'ui-lib',
      kind: AccordionItemKinds.Table,
      accordionName: 'parent',
      title: 'jest',
      modifiers: [],
      table: {
        columnList: [ { name: 'col1' } ],
        actionList: [],
        propertyList: [],
        filterList: [],
      },
    };
    expect(NormalizeAccordionItemTableComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion item table component options', () => {
    const options: AccordionItemTableComponentOptions = {
      name: 'logs',
      project: 'ui-lib',
      kind: AccordionItemKinds.Table,
      accordionName: 'admin',
      title: 'jest',
      modifiers: [],
      table: {
        columnList: [
          { name: 'date' },
          { name: 'level' },
          { name: 'message' },
        ],
        actionList: [],
        propertyList: [],
        filterList: [],
      },
    };
    expect(NormalizeAccordionItemTableComponentOptions(options)).toMatchSnapshot();
  });
});
