import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { VAULT_OPTIONS } from './tokens';
import { VaultModule } from './vault.module';
import { VaultService } from './vault.service';

jest.mock('node-vault', () => jest.fn(() => ({ token: '' })));

@Global()
@Module({ providers: [Logger], exports: [Logger] })
class LoggerModule {}

describe('VaultModule', () => {
  it('register adds the options provider', () => {
    const m = VaultModule.register();
    expect(m.providers!.some((p: any) => p.provide === VAULT_OPTIONS)).toBe(true);
  });

  it('registerAsync adds the options provider', () => {
    const m = VaultModule.registerAsync({ useFactory: () => ({}) });
    expect(m.providers!.some((p: any) => p.provide === VAULT_OPTIONS)).toBe(true);
  });

  it('provides a (disabled) VaultService', async () => {
    const ref = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true, load: [() => ({ VAULT_DISABLED: 'true' })] }),
        VaultModule.register({ endpoint: 'http://localhost:8200' }),
      ],
    }).compile();
    const service = ref.get(VaultService);
    expect(service.options.endpoint).toBe('http://localhost:8200');
    await expect(service.read('x')).rejects.toThrow('Vault is disabled');
  });
});
