import { ConfigService } from './config.service';

describe('Config', () => {

  describe('ConfigService', () => {

    it('get config by path', () => {

      const config = {
        test: 'value',
        obj: {
          item: 'value',
        },
      };

      const service = new ConfigService(config);

      expect(service.config).toEqual(config);
      expect(service.get('test')).toEqual(config.test);
      expect(service.get('obj')).toEqual(config.obj);
      expect(service.get('obj.item')).toEqual(config.obj.item);
      expect(service.get('obj.item2', 'default')).toEqual('default');


    });

  });

});
