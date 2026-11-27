import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ValkeyHealthIndicator } from './valkey.health-indicator';
import { ValkeyLockService } from './valkey-lock.service';
import { ValkeyModule } from './valkey.module';
import { ValkeyService } from './valkey.service';
import { VALKEY_MODULE_OPTIONS } from './tokens';
import { ValkeyModuleOptionsFactory } from './valkey-module-options.factory';

const mockRedisInstance = { on: jest.fn(), disconnect: jest.fn() };
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedisInstance),
}));

describe('ValkeyModule', () => {
  it('register() provides service, lock service and health indicator globally', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ValkeyModule.register({ host: 'h', port: 1 })],
    }).compile();

    expect(moduleRef.get(ValkeyService)).toBeInstanceOf(ValkeyService);
    expect(moduleRef.get(ValkeyLockService)).toBeInstanceOf(ValkeyLockService);
    expect(moduleRef.get(ValkeyHealthIndicator)).toBeDefined();
    expect(moduleRef.get(VALKEY_MODULE_OPTIONS)).toEqual({ host: 'h', port: 1 });
  });

  it('registerAsync() builds the options from the environment via the factory', async () => {
    process.env['VALKEY_URL'] = 'redis://:pw@env-host:6380';
    try {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true }),
          ValkeyModule.registerAsync({
            imports: [ConfigModule],
            useClass: ValkeyModuleOptionsFactory,
          }),
        ],
      }).compile();

      expect(moduleRef.get(VALKEY_MODULE_OPTIONS)).toMatchObject({
        url: 'redis://:pw@env-host:6380',
      });
    } finally {
      delete process.env['VALKEY_URL'];
    }
  });
});
