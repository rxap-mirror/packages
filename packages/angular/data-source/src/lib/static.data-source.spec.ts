import { observableDataSource } from './observable.data-source';
import { Subject } from 'rxjs';
import {
  fakeAsync,
  tick,
} from '@angular/core/testing';

describe('@rxap/data-source', () => {

  describe('StaticDataSource', () => {

    describe('dataSourceForm', () => {

      it('should emit new values to data source connections', fakeAsync(() => {

        const subject = new Subject();

        const dataSource = observableDataSource(subject);

        const connection1 = dataSource.connect({id: '1'});
        const connection2 = dataSource.connect({id: '2'});
        const connection3 = dataSource.connect({id: '3'});

        const subscribe1 = jest.fn();
        const subscribe2 = jest.fn();
        const subscribe3 = jest.fn();

        connection1.subscribe(subscribe1);
        connection2.subscribe(subscribe2);
        connection3.subscribe(subscribe3);

        expect(subscribe1).not.toBeCalled();
        expect(subscribe2).not.toBeCalled();
        expect(subscribe3).not.toBeCalled();

        subject.next('data');
        tick();

        expect(subscribe1).toBeCalled();
        expect(subscribe2).toBeCalled();
        expect(subscribe3).toBeCalled();

        subject.next('data');
        tick();

        expect(subscribe1).toBeCalledTimes(2);
        expect(subscribe2).toBeCalledTimes(2);
        expect(subscribe3).toBeCalledTimes(2);

      }));

    });

  });

});
