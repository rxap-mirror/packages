import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  Subject,
  from
} from 'rxjs';
import { TableDefinitionMetaDataKeys } from '../definition/decorators/meta-data-keys';
import {
  filter,
  startWith,
  switchMap,
  map
} from 'rxjs/operators';
import { RxapTableDefinition } from '../definition/table-definition';
import { getMetadata } from '@rxap/utilities';
import { Parser } from './parser';

export type TableTemplate = string;

@Injectable({ providedIn: 'root' })
export class TableTemplateLoader {

  public templates = new Map<string, TableTemplate>();

  public load$ = new Subject<string>();

  public update$ = new Subject<string>();

  public constructor(
    public readonly http: HttpClient
  ) {}

  public async getTemplate$(tableDefinition: RxapTableDefinition<any>): Promise<TableTemplate> {
    const tableId = tableDefinition.tableId;

    if (!tableId) {
      throw new Error('Table Definition has not a table id');
    }

    let template: string = this.templates.get(tableId) || '';

    if (!template) {

      let templateUrl = getMetadata<string>(TableDefinitionMetaDataKeys.TEMPLATE_URL, Object.getPrototypeOf(tableDefinition));
      template        = getMetadata<string>(TableDefinitionMetaDataKeys.TEMPLATE, Object.getPrototypeOf(tableDefinition)) || '';

      // if template and templateUrl are not defined
      if (!template && !templateUrl) {
        // set the default templateUrl
        templateUrl = `/assets/table-templates/${tableId}.xml`;
      }

      // if templateUrl is defined
      if (templateUrl) {
        // load template from url
        try {
          template = await this.http.get(templateUrl, { responseType: 'text' }).toPromise();
        } catch (e) {
          console.warn(`Could not load template table from url ${templateUrl}`, e.status);
        }
      }

      this.templates.set(tableId, template);

      this.load$.next(tableId);

    }

    return template;
  }

  public updateTemplate(tableId: string, template: TableTemplate): void {
    this.templates.set(tableId, template);
    this.update$.next(tableId);
  }

  public applyTemplate$<T>(tableDefinition: RxapTableDefinition<T>): Observable<RxapTableDefinition<T>> {

    const tableId = tableDefinition.tableId;

    if (!tableId) {
      throw new Error('Table Definition has not a table id');
    }

    return this.update$.pipe(
      filter(updateTableId => updateTableId === tableId),
      startWith(tableId),
      switchMap(() => from(this.getTemplate$(tableDefinition)).pipe(
        map(template => {
          if (template) {

            const table = Parser.CreateTableFromXml(template);

            table.apply(tableDefinition);

          }
          return tableDefinition;
        })
      ))
    );
  }

}
