import {RxapDataSource, StaticDataSource} from '@rxap/data-source';
import {Component, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DataSourceCollectionDirective} from './data-source-collection.directive';

describe('@rxap/data-source/directive', () => {

  describe('DataSourceCollectionDirective', () => {

    @RxapDataSource({
      id: 'test',
      data: [
        'data1',
        'data2',
        'data3',
        'data4',
        'data5',
        'data6',
      ],
    })
    @Injectable()
    class TestDataSource extends StaticDataSource<string[]> {
    }

    @RxapDataSource({
      id: 'test',
      data: [],
    })
    @Injectable()
    class TestEmptyDataSource extends StaticDataSource<string[]> {
    }

    @Component({
      template: `
          <div *rxapDataSourceCollection="let item from dataSource; empty: empty">
              {{item}}
          </div>

          <ng-template #empty>
              <div>empty</div>
          </ng-template>

      `,
    })
    class TestComponent {

      constructor(public readonly dataSource: TestDataSource) {
      }

    }

    xit('with filled list', async () => {

      await TestBed.configureTestingModule({
        imports: [DataSourceCollectionDirective],
        declarations: [TestComponent],
        providers: [TestDataSource],
      }).compileComponents();

      const componentFixture = TestBed.createComponent(TestComponent);

      componentFixture.detectChanges();

      const divElements = componentFixture.debugElement.queryAll(By.css('div'));

      expect(divElements.length).toEqual(6);

    });

    xit('with empty list', async () => {

      await TestBed.configureTestingModule({
        imports: [DataSourceCollectionDirective],
        declarations: [TestComponent],
        providers: [
          {
            provide: TestDataSource,
            useClass: TestEmptyDataSource,
          },
        ],
      }).compileComponents();

      const componentFixture = TestBed.createComponent(TestComponent);

      componentFixture.detectChanges();

      const divElements = componentFixture.debugElement.queryAll(By.css('div'));

      expect(divElements.length).toEqual(1);

    });

  });

});
