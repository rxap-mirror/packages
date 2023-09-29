import { inject } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {

  let service: LocalStorageService;
  const KEY = 'test_key';

  beforeEach(() => {
    let store: { [key: string]: any } = {};
    localStorage.getItem = jest.fn().mockImplementation((key: string) => {
      return store[key];
    });
    localStorage.setItem = jest.fn().mockImplementation((key: string, value: any) => {
      return (
        store[key] = value
      );
    });
    localStorage.removeItem = jest.fn().mockImplementation((key: string) => {
      delete store[key];
    });
    localStorage.clear = jest.fn().mockImplementation((key: string) => {
      store = {};
    });
  });

  beforeEach(inject([ LocalStorageService ], (_s: LocalStorageService) => {
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
