import { sandboxOf } from 'angular-playground';
import { TableContainerComponent } from './table-container.component';
import { TableContainerComponentModule } from './table-container.component.module';
import { RXAP_DATA_SOURCE_TOKEN } from '@rxap/data-source';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { HttpTableDataSource } from '../http-table.data-source';
import { RxapTable } from '../definition/decorators/table-definition';
import {
  RxapTableDefinition,
  RXAP_TABLE_SYSTEM_DEFINITION
} from '../definition/table-definition';
import { RxapTableColumn } from '../definition/decorators/column';
import {
  RxapColumn,
  FooterOptionsContentTypes,
  ColumnSortTypes
} from '@rxap/table-system';
import { RouterTestingModule } from '@angular/router/testing';
import { TableDefinitionLoader } from '../table-definition-loader';

interface User {
  username: string;
  email: string;
}

@RxapTable('with-template')
class SandboxTableDefinition extends RxapTableDefinition<User> {

  @RxapTableColumn({
    header: [ { text: 'Email' } ],
    sort:   ColumnSortTypes.SERVER,
    width:  150
  })
  public email!: RxapColumn;

  @RxapTableColumn({
    width:  500,
    sort:   ColumnSortTypes.SERVER,
    header: [ { content: FooterOptionsContentTypes.SERVER_FILTER }, 'Firstname' ]
  })
  public first_name!: RxapColumn;

  @RxapTableColumn({
    width:  700,
    sort:   ColumnSortTypes.SERVER,
    header: [ { content: FooterOptionsContentTypes.SERVER_FILTER }, 'Lastname' ]
  })
  public last_name!: RxapColumn;

}

export default sandboxOf(TableContainerComponent, {
  imports:          [
    TableContainerComponentModule,
    HttpClientModule,
    RouterTestingModule
  ],
  declareComponent: false
}).add('autoconfig', {
  template:  '<rxap-table-container></rxap-table-container>',
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
  template:  '<rxap-table-container></rxap-table-container>',
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
        return new HttpTableDataSource(http, 'http://localhost:3000/comments', 'source', null, {
          page:     '_page',
          pageSize: '_limit',
          sort:     '_sort',
          order:    '_order',
          filter:   '_filter'
        });
      },
      deps:       [ HttpClient ]
    }
  ]
}).add('from url template', {
  template:  '<rxap-table-container></rxap-table-container>',
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
        return new HttpTableDataSource(http, 'https://reqres.in/api/users', 'source');
      },
      deps:       [ HttpClient ]
    }
  ]
});
