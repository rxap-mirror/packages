import {
  Rule,
  schematic,
} from '@angular-devkit/schematics';
import { HasAccordionComponent } from './has-accordion-component';

export interface CoerceAccordionComponentOptions {
  accordionName: string;
  project: string;
  feature: string;
}

export function CoerceAccordionComponent(options: CoerceAccordionComponentOptions): Rule {
  const {
    accordionName,
    project,
    feature,
  } = options;
  return tree => {
    if (!HasAccordionComponent(tree, options)) {
      console.log(`The accordion component '${ accordionName }' does not exists in the feature '${ feature }' of the project '${ project }'. Accordion component will now be created ...`);
      return schematic(
        'accordion-component',
        {
          accordionName,
          project,
          feature,
          itemList: [],
        },
      );
    }
    return undefined;
  };
}
