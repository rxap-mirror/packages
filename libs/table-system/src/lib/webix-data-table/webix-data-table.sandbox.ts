import { sandboxOf } from 'angular-playground';
import { WebixDataTableComponent } from './webix-data-table.component';
import { WebixDataTableModule } from './webix-data-table.module';
import { RXAP_DATA_SOURCE_TOKEN } from '@rxap/data-source';
import {
  RxapTableDefinition,
  RXAP_TABLE_SYSTEM_DEFINITION
} from '../definition/table-definition';
import { RxapTable } from '../definition/decorators/table-definition';
import { TableDefinitionLoader } from '../table-definition-loader';
import {
  FooterOptionsContentTypes,
  RxapColumn
} from '../columns';
import { RxapTableColumn } from '../definition/decorators/column';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { HttpTableDataSource } from '../http-table.data-source';
import { RouterTestingModule } from '@angular/router/testing';

interface User {
  username: string;
  email: string;
}

@RxapTable('with-template')
class SandboxTableDefinition extends RxapTableDefinition<User> {

  @RxapTableColumn({
    header: [ { text: 'My User Id' } ],
    width:  150
  })
  public userId!: RxapColumn;

  @RxapTableColumn({
    width:  500,
    header: [ { content: FooterOptionsContentTypes.TEXT_FILTER }, 'Title' ]
  })
  public title!: RxapColumn;

  @RxapTableColumn({
    width:  700,
    header: [ { content: FooterOptionsContentTypes.TEXT_FILTER }, 'Body' ]
  })
  public body!: RxapColumn;

}

export default sandboxOf(WebixDataTableComponent, {
  imports:          [
    WebixDataTableModule,
    HttpClientModule,
    RouterTestingModule
  ],
  providers:        [],
  declareComponent: false
}).add('autoconfig', {
  template:  '<rxap-webix-data-table></rxap-webix-data-table>',
  providers: [
    {
      provide:    RXAP_DATA_SOURCE_TOKEN,
      useFactory: (http: HttpClient) => {
        return new HttpTableDataSource(http, 'https://jsonplaceholder.typicode.com/posts', 'source');
      },
      deps:       [ HttpClient ]
    }
  ]
}).add('width definition', {
  template:  '<rxap-webix-data-table></rxap-webix-data-table>',
  providers: [
    {
      provide:    RXAP_TABLE_SYSTEM_DEFINITION,
      useFactory: (tableDefinitionLoader: TableDefinitionLoader) => {
        return tableDefinitionLoader.load(SandboxTableDefinition);
      },
      deps:       [ TableDefinitionLoader ]
    },
    {
      provide:    RXAP_DATA_SOURCE_TOKEN,
      useFactory: (http: HttpClient) => {
        return new HttpTableDataSource(http, 'https://jsonplaceholder.typicode.com/posts', 'source');
      },
      deps:       [ HttpClient ]
    }
  ]
}).add('from url template', {
  template:  '<rxap-webix-data-table></rxap-webix-data-table>',
  providers: [
    {
      provide:    RXAP_TABLE_SYSTEM_DEFINITION,
      useFactory: () => {
        const definition = new RxapTableDefinition();
        definition.id    = 'with-remote-template';
        return definition;
      },
      deps:       []
    },
    {
      provide:    RXAP_DATA_SOURCE_TOKEN,
      useFactory: (http: HttpClient) => {
        return new HttpTableDataSource(http, 'https://jsonplaceholder.typicode.com/posts', 'source');
      },
      deps:       [ HttpClient ]
    }
  ]
});
