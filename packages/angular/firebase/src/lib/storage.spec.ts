import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFirebaseStorageEmulator, USE_STORAGE_EMULATOR } from './storage';
import { FIREBASE_STORAGE } from './tokens';

const connectStorageEmulator = jest.fn();
jest.mock('firebase/storage', () => ({ connectStorageEmulator: (...a: unknown[]) => connectStorageEmulator(...a) }));

describe('provideFirebaseStorageEmulator', () => {
  const storage = { storage: true };
  const setup = (emulator?: [string, number]) => {
    TestBed.configureTestingModule({
      providers: [
        provideFirebaseStorageEmulator(),
        { provide: FIREBASE_STORAGE, useValue: storage },
        ...(emulator ? [{ provide: USE_STORAGE_EMULATOR, useValue: emulator }] : []),
      ],
    });
    return TestBed.inject(ApplicationInitStatus).donePromise;
  };
  beforeEach(() => connectStorageEmulator.mockReset());

  it('connects to the emulator when configured', async () => {
    await setup(['localhost', 9199]);
    expect(connectStorageEmulator).toHaveBeenCalledWith(storage, 'localhost', 9199);
  });

  it('does nothing without emulator configuration', async () => {
    await setup();
    expect(connectStorageEmulator).not.toHaveBeenCalled();
  });
});
