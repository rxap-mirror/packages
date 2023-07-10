import {OpenApiConfigService} from './open-api-config.service';

describe('@rxap/open-api', () => {

  describe('OpenApiConfigService', () => {

    let service: OpenApiConfigService;

    beforeEach(() => {
      service = new OpenApiConfigService({
        openapi: '3.0',
        info: {
          title: 'testing',
          version: '1.0',
        },
        servers: [
          {
            url: 'http://localhost:4354',
          },
        ],
        paths: {},
      })
    });

    it('should insert server config', () => {

      service.insertServer({
        url: 'http://server.de',
      }, 1);

      expect(service.config.servers?.length).toBe(2);

      service.insertServer({
        url: 'http://server.de',
      });

      expect(service.config.servers?.length).toBe(2);
      expect(service.config.servers).toEqual([
        {
          url: 'http://server.de',
        },
        {
          url: 'http://server.de',
        },
      ])

    });

  });

});
