import {
  FeatureElement,
  DisplayColumn
} from './feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import {
  Rule,
  externalSchematic,
  noop,
  chain
} from '@angular-devkit/schematics';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { GenerateSchema } from '../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FeatureElement)
@ElementDef('expandable')
export class ExpandableRowElement extends FeatureElement {

  private get colspan(): string {

    if (this.__parent.hasFeature('column-menu')) {
      return `rxapTableColumns.displayColumns.length`;
    } else {
      return this.__parent.columns.length.toFixed(0);
    }

  }

  private get expandedContentComponentSelector(): string {
    return 'rxap-expanded-row-content';
  }

  public columnTemplate(): string {
    return NodeFactory('ng-container', 'matColumnDef="expandControl"')([
             NodeFactory('th', 'mat-header-cell', '*matHeaderCellDef')(),
             NodeFactory('td', 'mat-cell', '[rxap-expand-controls-cell]="element"', '*matCellDef="let element"')()
           ])
           +
           NodeFactory('ng-container', 'matColumnDef="expandedRow"')(
             NodeFactory('td', 'mat-cell', '[rxap-expand-row]="element"', '*matCellDef="let element"', `[colSpan]="${this.colspan}"`)(
               NodeFactory('ng-template', 'rxapExpandRowContent', 'let-expandedElement')(
                 NodeFactory(this.expandedContentComponentSelector, '[expandedElement]="expandedElement"')()
               )
             )
           );
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name:   'expandControl',
      hidden: true
    };
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'ExpandRowModule', '@rxap/table-system');
    AddNgModuleImport(
      sourceFile,
      `${classify('expanded-row-content')}ComponentModule`,
      `./expanded-row-content/expanded-row-content.component.module`
    );
  }

  public tableTemplate(): string {
    return 'multiTemplateDataRows';
  }

  public columnTemplateFilter(): string {
    return FeatureElement.ColumnNoFilter('expandControl', true);
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const rules: Rule[] = [ super.toValue({ project, options }) ];

    rules.push(tree => {
      const path = options.path?.replace(/^\//, '') ?? '';
      if (!tree.exists(join(path, 'expanded-row-content', 'expanded-row-content.component.module.ts'))) {
        return externalSchematic(
          '@rxap/schematics',
          'component-module',
          {
            name:     'expanded-row-content',
            project:  options.project,
            path:     options.path?.replace(/^\//, ''),
            prefix:   'rxap',
            selector: this.expandedContentComponentSelector
          }
        );
      } else {
        return noop();
      }
    });

    return chain(rules);
  }

}
