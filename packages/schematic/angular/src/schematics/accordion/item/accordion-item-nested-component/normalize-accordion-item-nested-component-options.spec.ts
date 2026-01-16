import {
  AccordionItemKinds,
  BackendTypes,
} from '@rxap/schematic-angular';
import { NormalizeAccordionItemNestedComponentOptions } from './normalize-accordion-item-nested-component-options';
import { AccordionItemNestedComponentOptions } from './schema';

describe('NormalizeAccordionItemNestedComponentOptions', () => {
  it('should normalize minimal accordion item nested component options', () => {
    const options: AccordionItemNestedComponentOptions = {
      name: 'test-nested',
      project: 'ui-lib',
      title: 'jest',
      modifiers: [],
      kind: AccordionItemKinds.Nested,
      accordionName: 'parent-accordion',
      accordion: {
        itemList: [],
      },
    };

    expect(NormalizeAccordionItemNestedComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion item nested component options', () => {
    const options: AccordionItemNestedComponentOptions = {
      name: 'test-nested',
      project: 'ui-lib',
      title: 'jest',
      modifiers: [],
      kind: AccordionItemKinds.Nested,
      accordionName: 'parent-accordion',
      accordion: {
        name: 'nested-accordion',
        multiple: true,
        itemList: [],
      },
      backend: {
        kind: BackendTypes.NESTJS,
      },
    };

    expect(NormalizeAccordionItemNestedComponentOptions(options)).toMatchSnapshot();
  });
});
