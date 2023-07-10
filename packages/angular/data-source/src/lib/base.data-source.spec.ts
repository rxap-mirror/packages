import {
  BaseDataSource,
  BaseDataSourceViewer,
  RxapDataSource,
} from './base.data-source';
import { fakeAsync } from '@angular/core/testing';
import { StaticDataSource } from './static.data-source';

describe('@rxap/data-source', () => {

  describe('BaseDataSource', () => {

    let dataSource: BaseDataSource<any>;

    beforeEach(() => {
      dataSource = new BaseDataSource<any>({
        id: 'test',
        deps: [],
      });
    });

    it('connect and disconnect', () => {

      const viewer: BaseDataSourceViewer = { id: 'test' };

      const connection = dataSource.connect(viewer);

      expect(dataSource.isConnected(viewer)).toBeTruthy();

      dataSource.disconnect(viewer);

      expect(dataSource.isConnected(viewer)).toBeFalsy();

    });

  });

  describe('StaticDataSource', () => {

    const staticData = 'data';
    let dataSource: StaticDataSource<string>;

    beforeEach(() => {
      dataSource = new StaticDataSource<string>(
        staticData,
        {
          id: 'test',
          deps: [],
        },
      );
    });

    it('should emit static data on subscribe', fakeAsync(() => {

      const connection = dataSource.connect({ id: 'test' });

      const nextSpy = jest.fn();
      const errorSpy = jest.fn();
      const completeSpy = jest.fn();

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      expect(nextSpy).toBeCalledTimes(1);
      expect(nextSpy).toBeCalledWith(staticData);
      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();

      dataSource.disconnect({ id: 'test' });

    }));

    it('should emit data if changed', fakeAsync(() => {

      const connection = dataSource.connect({ id: 'test' });

      const nextSpy = jest.fn();
      const errorSpy = jest.fn();
      const completeSpy = jest.fn();

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      expect(nextSpy).toBeCalledTimes(1);
      expect(nextSpy).toBeCalledWith(staticData);
      expect(dataSource.data).toBe(staticData);
      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();

      const newStaticData = 'new data';

      dataSource.data = newStaticData;

      expect(nextSpy).toBeCalledTimes(2);
      expect(nextSpy).toHaveBeenNthCalledWith(1, staticData);
      expect(nextSpy).toHaveBeenNthCalledWith(2, newStaticData);
      expect(dataSource.data).toBe(newStaticData);
      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();

      dataSource.disconnect({ id: 'test' });

    }));

  });

  describe('@RxapDataSource', () => {

    const metadata = {
      id: 'test',
      deps: [],
    };

    @RxapDataSource(metadata)
    class DataSource extends BaseDataSource<any> {
    }

    it('should add meta data to base data source', () => {

      expect(new DataSource().metadata).toEqual(metadata);

    });

    it('should overwrite data source metadata with constructor metadata', () => {

      const customMetadata = {
        id: 'custom',
        deps: [],
      };

      expect(new DataSource(customMetadata).metadata).toEqual(customMetadata);

    });

  });

});
