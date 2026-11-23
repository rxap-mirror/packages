import { observableDataSource } from './observable.data-source';
import { Subject } from 'rxjs';

describe('@rxap/data-source', () => {
  describe('StaticDataSource', () => {
    describe('dataSourceForm', () => {
      it('should emit new values to data source connections', () => {
        const subject = new Subject();

        const dataSource = observableDataSource(subject);

        const connection1 = dataSource.connect({ id: '1' });
        const connection2 = dataSource.connect({ id: '2' });
        const connection3 = dataSource.connect({ id: '3' });

        const subscribe1 = vi.fn();
        const subscribe2 = vi.fn();
        const subscribe3 = vi.fn();

        connection1.subscribe(subscribe1);
        connection2.subscribe(subscribe2);
        connection3.subscribe(subscribe3);

        expect(subscribe1).not.toHaveBeenCalled();
        expect(subscribe2).not.toHaveBeenCalled();
        expect(subscribe3).not.toHaveBeenCalled();

        subject.next('data');

        expect(subscribe1).toHaveBeenCalled();
        expect(subscribe2).toHaveBeenCalled();
        expect(subscribe3).toHaveBeenCalled();

        subject.next('data');

        expect(subscribe1).toHaveBeenCalledTimes(2);
        expect(subscribe2).toHaveBeenCalledTimes(2);
        expect(subscribe3).toHaveBeenCalledTimes(2);
      });
    });
  });
});
