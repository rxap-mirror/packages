import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { OpenApiModuleOptionsLoader } from '@rxap/nest-open-api';
import {
  MockConfigService,
  MockConfigServiceFactory,
  MockLoggerFactory,
} from '@rxap/nest-testing';

describe('OpenApiModuleOptionsLoader', () => {

  let loader: OpenApiModuleOptionsLoader;
  let config: MockConfigService;

  beforeEach(async () => {
    const ref = await Test.createTestingModule({
      providers: [
        OpenApiModuleOptionsLoader, {
          provide: ConfigService,
          useValue: MockConfigServiceFactory(),
        },
        {
          provide: Logger,
          useValue: MockLoggerFactory(),
        }
      ],
    }).compile();
    config = ref.get(ConfigService);
    loader = ref.get(OpenApiModuleOptionsLoader);
  });

  it('should interpolate env variables', () => {
    config.set('REMOTE_DOMAIN', 'example.com');
    config.set('OPEN_API_SERVER_CONFIG_FILE_PATH', 'path');
    jest.spyOn(loader as any, 'existsFileWithScope').mockReturnValue(true);
    jest.spyOn(loader as any, 'readFileWithScope').mockReturnValue(JSON.stringify({ url: 'https://${REMOTE_DOMAIN}/api' }));
    const options = loader.create();
    expect(options).toEqual({ serverConfig: { url: 'https://example.com/api' } });
  });

});
