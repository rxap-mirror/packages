import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BaseDataSource,
  RXAP_DATA_SOURCE_TOKEN
} from './base.data-source';

describe('Data Source', () => {

  describe('Parent DataSource Feature', () => {

    interface Game {
      name: string;
    }

    interface User {
      username: string;
      games: Game[];
    }

    const userSource = {
      username: 'unitedpe',
      games:    []
    };

    let userDataSource: BaseDataSource<User>;
    let gamesDataSource: BaseDataSource<Game[], User>;

    const UserDataSourceToken  = new InjectionToken('user');
    const GamesDataSourceToken = new InjectionToken('games');

    beforeEach(() => {

      TestBed.configureTestingModule({
        providers: [
          {
            provide:    UserDataSourceToken,
            useFactory: () => new BaseDataSource<User>(
              'user',
              userSource
            )
          },
          {
            provide:    GamesDataSourceToken,
            useFactory: (source: BaseDataSource<User>) => new BaseDataSource<Game[], User>(
              'games',
              source,
              user => user.games
            ),
            deps:       [ UserDataSourceToken ]
          }
        ]
      });

      userDataSource  = TestBed.get(UserDataSourceToken);
      gamesDataSource = TestBed.get(GamesDataSourceToken);

    });

    it('should return object of user', async () => {

      console.log(userDataSource.source);


      expect(await userDataSource.connect({ id: 'id' }).toPromise()).toEqual(userSource);

    });

    it('should return array of games', async () => {

      expect(await gamesDataSource.connect({ id: 'id' }).toPromise()).toEqual(userSource.games);

    });

  });

  describe('static dataSource Feature', () => {

    const staticSource = 'static source';

    let staticDataSource: BaseDataSource<string>;

    beforeEach(() => {

      TestBed.configureTestingModule({
        providers: [
          {
            provide:    RXAP_DATA_SOURCE_TOKEN,
            useFactory: () => new BaseDataSource<string>(
              'user',
              staticSource
            )
          }
        ]
      });

      staticDataSource = TestBed.get(RXAP_DATA_SOURCE_TOKEN);

    });

    it('should return static source value', async () => {

      expect(await staticDataSource.source$.toPromise()).toEqual(staticSource);
      expect(await staticDataSource.source$.toPromise()).toEqual(staticSource);
      expect(await staticDataSource.source$.toPromise()).toEqual(staticSource);

      expect(await staticDataSource.connect({ id: 'id' }).toPromise()).toEqual(staticSource);
      expect(await staticDataSource.connect({ id: 'id1' }).toPromise()).toEqual(staticSource);
      expect(await staticDataSource.connect({ id: 'id2' }).toPromise()).toEqual(staticSource);
      expect(await staticDataSource.connect({ id: 'id3' }).toPromise()).toEqual(staticSource);

    });


  });

  it('connect and disconnect from DataSource', () => {

    const dataSource = new BaseDataSource('data-source');
    const viewer     = { id: 'viewer' };

    const collection$ = dataSource.connect(viewer);

    const subscription = collection$.subscribe();

    expect(subscription.closed).toBeFalsy();

    dataSource.disconnect(viewer);

    expect(subscription.closed).toBeTruthy();

  });

});
