import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { provideAngularFireStorageEmulator, USE_STORAGE_EMULATOR } from './storage';

jest.mock('@angular/fire/compat/storage', () => ({ AngularFireStorage: class {} }));

describe('provideAngularFireStorageEmulator', () => {
  const useEmulator = jest.fn();
  const setup = (emulator?: [string, number]) => {
    TestBed.configureTestingModule({
      providers: [
        provideAngularFireStorageEmulator(),
        { provide: AngularFireStorage, useValue: { storage: { useEmulator } } },
        ...(emulator ? [{ provide: USE_STORAGE_EMULATOR, useValue: emulator }] : []),
      ],
    });
    return TestBed.inject(ApplicationInitStatus).donePromise;
  };
  beforeEach(() => useEmulator.mockReset());

  it('connects to the emulator when configured', async () => {
    await setup(['localhost', 9199]);
    expect(useEmulator).toHaveBeenCalledWith('localhost', 9199);
  });

  it('does nothing without emulator configuration', async () => {
    await setup();
    expect(useEmulator).not.toHaveBeenCalled();
  });
});
