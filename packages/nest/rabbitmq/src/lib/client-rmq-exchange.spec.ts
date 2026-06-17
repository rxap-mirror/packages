import { ClientRMQExchange } from './client-rmq-exchange';

describe('ClientRMQExchange.handleMessage', () => {

  function createInstance(deserializeResult: any) {
    const instance: any = Object.create(ClientRMQExchange.prototype);
    instance.logger = { verbose: jest.fn() };
    instance.deserializer = {
      deserialize: jest.fn().mockResolvedValue(deserializeResult),
    };
    return instance;
  }

  it('should resolve the callback when called with the (packet, callback) overload', async () => {
    const instance = createInstance({ err: null, response: 'ok', isDisposed: false });
    const callback = jest.fn();

    await expect(instance.handleMessage({ data: 1 }, callback)).resolves.toBeUndefined();

    expect(callback).toHaveBeenCalledWith({ err: null, response: 'ok' });
  });

  it('should pass options to the deserializer with the (packet, options, callback) overload', async () => {
    const instance = createInstance({ err: null, response: 'ok', isDisposed: false });
    const callback = jest.fn();
    const options = { fields: { deliveryTag: 1 } };

    await instance.handleMessage({ data: 1 }, options, callback);

    expect(instance.deserializer.deserialize).toHaveBeenCalledWith({ data: 1 }, options);
    expect(callback).toHaveBeenCalled();
  });

});
