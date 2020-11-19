import {
  ElementAttribute,
  ElementChild,
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ColumnElement } from './columns/column.element';
import { strings } from '@angular-devkit/core';
import { ParsedElement } from '@rxap/xml-parser';
import { Project } from 'ts-morph';
import { FeatureElement } from './features/feature.element';
import { GenerateSchema } from '../schema';
import { AdapterElement } from './adapter.element';
import {
  ToValueContext,
  FindComponentSourceFile,
  AddComponentAnimations,
  FindComponentModuleSourceFile,
  AddNgModuleImport,
  AddDir,
  MethodElement,
  AddComponentProvider,
  AddComponentInput,
  NodeFactory,
  WithTemplate
} from '@rxap-schematics/utilities';
import { FormElement } from '@rxap/forms/schematics/generate/elements/form.element';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';

const { dasherize, classify, camelize } = strings;

@ElementDef('definition')
export class TableElement implements ParsedElement<Rule> {

  @ElementAttribute()
  public id!: string;

  /**
   * Coerce the id with the 'table' suffix
   */
  public get name(): string {
    const cleanId = dasherize(this.id);
    if (!(cleanId).match(/-table$/)) {
      return cleanId + '-table';
    }
    return cleanId;
  }

  @ElementChildTextContent()
  public title?: string;

  @ElementChild(MethodElement)
  public method?: MethodElement;

  @ElementChildren(ColumnElement, { group: 'columns' })
  @ElementRequired()
  public columns!: ColumnElement[];

  @ElementChildren(FeatureElement, { group: 'features' })
  public features?: FeatureElement[];

  @ElementChild(AdapterElement)
  public adapter?: AdapterElement;

  public hasFeature(name: string): boolean {
    return !!this.features?.find(feature => feature.__tag === name);
  }

  public getFeature(name: string): FeatureElement | undefined {
    return this.features?.find(feature => feature.__tag === name);
  }

  public get hasFilter(): boolean {
    return this.columns.some(column => column.filter);
  }

  public validate(): boolean {
    return true;
  }

  public columnsTemplate(): string {
    let template = '<!-- region columns -->';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.columnTemplate();
      }
    }

    for (const column of this.columns) {
      template += `<ng-container matColumnDef="${column.name}">\n`;
      template += column.template();
      template += '\n</ng-container>';
    }

    template += '<!-- endregion -->';
    return template;
  }

  public columnsFilterTemplate(): string {
    if (!this.hasFilter) {
      return '';
    }
    let template = '<!-- region filter columns -->';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.columnTemplateFilter();
      }
    }

    for (const column of this.columns) {
      template += `<ng-container matColumnDef="filter_${column.name}">\n`;
      if (column.filter) {
        template += column.templateFilter();
      } else {
        template += column.templateNoFiler();
      }
      template += '\n</ng-container>';
    }
    template += '<!-- endregion -->';
    return template;
  }

  public createFormElement(): FormElement {
    const formElement    = new FormElement();
    formElement.id       = dasherize(this.id) + '-filter';
    formElement.controls = this.columns.filter(column => column.filter).map(column => column.createControlElement());
    return formElement;
  }

  public footerTemplate(): string {
    let template = '<mat-card-footer>';
    if (this.features) {
      for (const feature of this.features) {
        template += feature.footerTemplate();
      }
    }
    template += '</mat-card-footer>';
    return template;
  }

  public headerTemplate(): string {
    let template = '<mat-progress-bar rxapCardProgressBar [loading$]="tableDataSourceDirective.loading$"></mat-progress-bar>';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.headerTemplate();
      }
    }

    if (!this.hasFeature('navigate-back') && this.title) {
      template += `<mat-card-title i18n="@@table.${dasherize(this.id)}.title">${this.title}</mat-card-title>`;
    }

    return template;
  }

  public tableTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'mat-table',
      '#tableDataSourceDirective="rxapTableDataSource"'
    ];
    if (this.method) {
      attributes.push('rxapTableDataSource');
    } else {
      attributes.push('[rxapTableDataSource]="dataSource"');
    }
    if (this.hasFilter) {
      attributes.push('rxap-filter-header-row');
    }
    const nodes: Array<Partial<WithTemplate> | string> | string = [
      this.columnsTemplate(),
      this.columnsFilterTemplate(),
      this.rowTemplate()
    ];

    if (this.features) {
      attributes.unshift(...this.features.map(feature => feature.tableTemplate()));
    }

    return NodeFactory('table', ...attributes)(nodes);
  }

  public rowTemplate(): string {
    let template = '';

    if (this.hasFilter) {
      template += '<tr mat-header-row *matHeaderRowDef="rxapTableColumns.displayColumns | toFilterColumnNames"></tr>';
    }

    template += `
    <tr mat-header-row *matHeaderRowDef="rxapTableColumns.displayColumns"></tr>
    <tr [@rowsAnimation] mat-row *matRowDef="let element; columns: rxapTableColumns.displayColumns;"></tr>
    `;

    return template;
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      tree => AddDir(tree.getDir(options.path!), project, undefined, pathFragment => !!pathFragment.match(/\.ts$/)),
      chain(this.columns.map(column => column.toValue({ project, options }))),
      chain(this.features?.map(node => node.toValue({ project, options })) ?? []),
      () => this.handleComponent(project, options),
      () => this.handleComponentModule(project, options)
    ]);
  }

  private handleComponent(project: Project, options: GenerateSchema) {
    const sourceFile = FindComponentSourceFile(this.name, project);

    // TODO : mv RowAnimation to rxap
    AddComponentAnimations(sourceFile, 'RowAnimation', '@mfd/shared/row-animation');

    if (this.method) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'TABLE_REMOTE_METHOD',
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            namedImports:    [ 'TABLE_REMOTE_METHOD' ],
            // TODO : mv TABLE_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/table-data-source.directive'
          }
        ]
      );
    } else {
      AddComponentInput(
        sourceFile,
        {
          name:     'dataSource',
          type:     'AbstractTableDataSource<any>',
          required: true
        },
        [
          {
            namedImports:    [ 'AbstractTableDataSource' ],
            moduleSpecifier: '@rxap/data-source'
          }
        ]
      );
    }

    if (this.hasFilter) {
      AddComponentProvider(
        sourceFile,
        {
          provide:    'RXAP_TABLE_FILTER_FORM_DEFINITION',
          useFactory: 'FormFactory',
          deps:       [ 'INJECTOR' ]
        },
        [
          {
            namedImports:    [ 'RXAP_TABLE_FILTER_FORM_DEFINITION' ],
            moduleSpecifier: '@mfd/shared/table-filter/tokens'
          },
          {
            namedImports:    [ 'FormFactory', 'FormProviders' ],
            moduleSpecifier: './form.providers'
          },
          {
            namedImports:    [ 'INJECTOR' ],
            moduleSpecifier: '@angular/core'
          }
        ]
      );
      AddComponentProvider(sourceFile, 'FormProviders', [
        {
          namedImports:    [ 'FormFactory' ],
          moduleSpecifier: './form.providers'
        }
      ]);
    }

    if (this.adapter) {
      this.adapter.handleComponent({ sourceFile });
    }

    this.features?.forEach(feature => feature.handleComponent({ sourceFile, project, options }));
    this.columns?.forEach(column => column.handleComponent({ sourceFile, project, options }));
  }

  private handleComponentModule(project: Project, options: GenerateSchema) {
    const sourceFile = FindComponentModuleSourceFile(this.name, project);

    // core table modules
    AddNgModuleImport(sourceFile, 'MatCardModule', '@angular/material/card');
    AddNgModuleImport(sourceFile, 'MatProgressBarModule', '@angular/material/progress-bar');
    AddNgModuleImport(sourceFile, 'CardProgressBarModule', '@rxap/directives/material/card');
    AddNgModuleImport(sourceFile, 'MatTableModule', '@angular/material/table');
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    // TODO : move TableDataSourceModule to rxap
    AddNgModuleImport(sourceFile, 'TableDataSourceModule', '@mfd/shared/table-data-source.directive');

    // filter table modules
    if (this.hasFilter) {
      // TODO : move TableFilterModule to rxap
      AddNgModuleImport(sourceFile, 'TableFilterModule', '@mfd/shared/table-filter/table-filter.module');
      AddNgModuleImport(sourceFile, 'RxapFormsModule', '@rxap/forms');
      AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
    }

    this.features?.forEach(feature => feature.handleComponentModule({ sourceFile, project, options }));
    this.columns?.forEach(column => column.handleComponentModule({ sourceFile, project, options }));

  }

}
