import { StaticDataSource } from './static.data-source';
import { ObservableDataSource } from './observable.data-source';

describe('@rxap/data-source', () => {

  describe('ObservableDataSource', () => {

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('BUG: disconnect from data source if a connection observable is used as source', async () => {

      const dataSource = new StaticDataSource('data', { id: 'static' });

      expect(dataSource.hasConnections).toBeFalsy();

      const source = dataSource.connect({ id: 'test' });

      expect(dataSource.hasConnections).toBeTruthy();
      expect(dataSource.isConnected('test')).toBeTruthy();

      const observableDataSource = new ObservableDataSource(source, { id: 'observable' });

      observableDataSource.connect({ id: 'test' });
      observableDataSource.disconnect('test');

      // let any (wrongly) scheduled disconnect run before asserting
      await jest.advanceTimersByTimeAsync(10000);

      expect(dataSource.hasConnections).toBeTruthy();
      expect(dataSource.isConnected('test')).toBeTruthy();

    });

  });

});
