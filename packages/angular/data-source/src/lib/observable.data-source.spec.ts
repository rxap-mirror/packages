import { StaticDataSource } from './static.data-source';
import { ObservableDataSource } from './observable.data-source';
import {
  fakeAsync,
  tick,
} from '@angular/core/testing';

describe('@rxap/data-source', () => {

  describe('ObservableDataSource', () => {

    it('BUG: disconnect from data source if a connection observable is used as source', fakeAsync(() => {

      const dataSource = new StaticDataSource('data', { id: 'static' });

      expect(dataSource.hasConnections).toBeFalsy();

      const source = dataSource.connect({id: 'test'});

      expect(dataSource.hasConnections).toBeTruthy();
      expect(dataSource.isConnected('test')).toBeTruthy();

      const observableDataSource = new ObservableDataSource(source, {id: 'observable'});

      observableDataSource.connect({id: 'test'});
      observableDataSource.disconnect('test');

      tick(10000);

      expect(dataSource.hasConnections).toBeTruthy();
      expect(dataSource.isConnected('test')).toBeTruthy();

    }));

  });

});
