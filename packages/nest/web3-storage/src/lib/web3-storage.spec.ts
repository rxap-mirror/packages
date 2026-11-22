import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WEB3_STORAGE_OPTIONS } from './tokens';
import { Web3StorageModuleOptionsLoader } from './web3-storage-module-options-loader';
import { Web3StorageModule } from './web3-storage.module';
import { Web3StorageService } from './web3-storage.service';

describe('Web3StorageModuleOptionsLoader', () => {
  it('reads the token from config', () => {
    const loader = new Web3StorageModuleOptionsLoader();
    const getOrThrow = jest.fn().mockReturnValue('tok');
    (loader as any).config = { getOrThrow };
    expect(loader.create()).toEqual({ token: 'tok' });
    expect(getOrThrow).toHaveBeenCalledWith('WEB3_STORAGE_TOKEN');
  });
});

describe('Web3StorageModule', () => {
  it('register/registerAsync add the options provider', () => {
    for (const m of [
      Web3StorageModule.register({ token: 't' }),
      Web3StorageModule.registerAsync({ useFactory: () => ({ token: 't' }) }),
    ]) {
      expect(m.providers!.some((p: any) => p.provide === WEB3_STORAGE_OPTIONS)).toBe(true);
    }
  });

  it('provides a Web3StorageService', async () => {
    const logger = { log: jest.fn() };
    const ref = await Test.createTestingModule({
      imports: [Web3StorageModule.register({ token: 'tok' })],
    })
      .overrideProvider(Logger)
      .useValue(logger)
      .compile();
    const service = ref.get(Web3StorageService);
    expect(service).toBeInstanceOf(Web3StorageService);
    expect(service.token).toBe('tok');
    expect(logger.log).toHaveBeenCalledWith('Initialized web3 storage client', 'Web3StorageService');
  });
});
