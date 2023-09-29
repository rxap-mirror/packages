import { inject } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {

  let service: SessionStorageService;
  const KEY = 'test_key';

  beforeEach(() => {
    let store: { [key: string]: any } = {};
    sessionStorage.getItem = jest.fn().mockImplementation((key: string) => {
      return store[key];
    });
    sessionStorage.setItem = jest.fn().mockImplementation((key: string, value: any) => {
      return (
        store[key] = value
      );
    });
    sessionStorage.removeItem = jest.fn().mockImplementation((key: string) => {
      delete store[key];
    });
    sessionStorage.clear = jest.fn().mockImplementation((key: string) => {
      store = {};
    });
  });

  beforeEach(inject([ SessionStorageService ], (_s: SessionStorageService) => {
    service = _s;
  }));

  it(`should set result to 1 by called [set]`, () => {
    const value = 1;
    service.set(KEY, value);
    expect(service.get(KEY)).toBe(value);
  });

  it(`should set result to 1 by called [get]`, () => {
    const value = 1;
    service.set(KEY, value);
    expect(service.get(KEY)).toBe(value);
  });

  it(`should be called [remove]`, () => {
    const value = 1;
    service.set(KEY, value);
    service.remove(KEY);
    expect(service.get(KEY)).toBeNull();
  });

  it(`should be expired data`, (done: any) => {
    const value = 1;
    service.set(KEY, value, 10, 't');
    expect(service.get(KEY)).toBe(value);
    setTimeout(() => {
      expect(service.get(KEY)).toBeNull();
      done();
    }, 100);
  });

});
