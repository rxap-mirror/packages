import { AccordionItemKinds } from '@rxap/schematic-angular';
import { NormalizeAccordionItemSwitchComponentOptions } from './normalize-accordion-item-switch-component-options';
import { AccordionItemSwitchComponentOptions } from './schema';

describe('NormalizeAccordionItemSwitchComponentOptions', () => {
  it('should normalize minimal accordion item switch component options', () => {
    const options: AccordionItemSwitchComponentOptions = {
      name: 'test-as',
      project: 'ui-lib',
      title: 'jest',
      modifiers: [],
      kind: AccordionItemKinds.Switch,
      accordionName: 'parent',
      switch: {
        property: { name: 'type' },
        defaultCase: { itemList: [] },
      },
    };
    expect(NormalizeAccordionItemSwitchComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion item switch component options', () => {
    const options: AccordionItemSwitchComponentOptions = {
      name: 'content-switch',
      project: 'ui-lib',
      title: 'jest',
      modifiers: [],
      kind: AccordionItemKinds.Switch,
      accordionName: 'main',
      switch: {
        property: { name: 'contentType' },
        case: [
          {
            test: 'video',
            itemList: [
              {
                  name: 'video-player',
                  kind: AccordionItemKinds.Nested,
                title: 'jest',
                modifiers: [],
              }
            ],
          },
        ],
        defaultCase: {
          itemList: [
             {
                  name: 'text-view',
                  kind: AccordionItemKinds.Nested,
               title: 'jest',
               modifiers: [],
             }
          ],
        },
      },
    };
    expect(NormalizeAccordionItemSwitchComponentOptions(options)).toMatchSnapshot();
  });
});
