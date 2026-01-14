import {
  chain,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { AccordionItemKinds } from '@rxap/schematic-angular';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedAccordionItemComponentOptions } from './normalize-accordion-item-standalone-component-options';
import { panelItemRule } from './panel-item/panel-item-rule';

export function itemRule(normalizedOptions: NormalizedAccordionItemComponentOptions): Rule {

  const {
    kind,
  } = normalizedOptions;

  const rules: Rule[] = [
    () => console.log(`Modify accordion item component for type '${ kind }' ...`),
  ];

  switch (kind) {
    case AccordionItemKinds.Default:
      rules.push(panelItemRule(normalizedOptions));
      break;
    case AccordionItemKinds.Table:
      rules.push(ExecuteSchematic('accordion-item-table-component', normalizedOptions));
      break;
    case AccordionItemKinds.DataGrid:
      rules.push(ExecuteSchematic('accordion-item-data-grid-component', normalizedOptions));
      break;
    case AccordionItemKinds.TreeTable:
      rules.push(ExecuteSchematic('accordion-item-tree-table-component', normalizedOptions));
      break;
    case AccordionItemKinds.Switch:
      rules.push(ExecuteSchematic('accordion-item-switch-component', normalizedOptions));
      break;
    case AccordionItemKinds.Nested:
      rules.push(ExecuteSchematic('accordion-item-nested-component', normalizedOptions));
      break;
    default:
      throw new SchematicsException(`Invalid accordion item type '${ kind }'!`);

  }

  return chain(rules);

}