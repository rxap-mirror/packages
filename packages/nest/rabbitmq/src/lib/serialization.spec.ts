import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  GoneException,
  HttpException,
  HttpVersionNotSupportedException,
  ImATeapotException,
  InternalServerErrorException,
  MethodNotAllowedException,
  MisdirectedException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  PreconditionFailedException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ErrorDeserializer } from './error.deserializer';
import { ErrorSerializer } from './error.serializer';
import { RabbitMqIncomingRequestDeserializer } from './incoming-request.deserializer';
import { IncomingResponseDeserializer } from './incoming-response.deserializer';

describe('ErrorSerializer', () => {
  const serializer = new ErrorSerializer();

  it('serializes plain errors', () => {
    const e = new TypeError('boom');
    expect(serializer.serialize(e)).toEqual({ name: 'TypeError', message: 'boom', stack: e.stack });
  });

  it('adds response, status and cause for http exceptions', () => {
    const e = new NotFoundException('nope', { cause: 'why' });
    const s = serializer.serialize(e);
    expect(s['status']).toBe(404);
    expect(s['response']).toEqual(e.getResponse());
    expect(s['cause']).toBe('why');
    expect(s.name).toBe('NotFoundException');
  });

  it('serializes non errors as Unknown and handles circular structures', () => {
    expect(serializer.serialize('text')).toEqual({ name: 'Unknown', message: '"text"' });
    const circular: any = { a: 1 };
    circular.self = circular;
    expect(JSON.parse(serializer.serialize(circular).message)).toEqual({ a: 1, self: '[Circular]' });
  });
});

describe('ErrorDeserializer', () => {
  const deserializer = new ErrorDeserializer();

  it.each<[string, new () => HttpException]>([
    ['BadGatewayException', BadGatewayException],
    ['BadRequestException', BadRequestException],
    ['ConflictException', ConflictException],
    ['ForbiddenException', ForbiddenException],
    ['GatewayTimeoutException', GatewayTimeoutException],
    ['GoneException', GoneException],
    ['HttpVersionNotSupportedException', HttpVersionNotSupportedException],
    ['ImATeapotException', ImATeapotException],
    ['InternalServerErrorException', InternalServerErrorException],
    ['MethodNotAllowedException', MethodNotAllowedException],
    ['MisdirectedException', MisdirectedException],
    ['NotAcceptableException', NotAcceptableException],
    ['NotFoundException', NotFoundException],
    ['NotImplementedException', NotImplementedException],
    ['PayloadTooLargeException', PayloadTooLargeException],
    ['PreconditionFailedException', PreconditionFailedException],
    ['RequestTimeoutException', RequestTimeoutException],
    ['ServiceUnavailableException', ServiceUnavailableException],
    ['UnauthorizedException', UnauthorizedException],
    ['UnprocessableEntityException', UnprocessableEntityException],
    ['UnsupportedMediaTypeException', UnsupportedMediaTypeException],
  ])('restores %s', (name, ctor) => {
    const record = { name, message: 'm', response: { message: 'm' }, status: 418, cause: 'c' };
    const error = deserializer.deserialize(record) as HttpException;
    expect(error).toBeInstanceOf(ctor);
    expect(error.message).toBe('m');
    expect(error.getResponse()).toEqual({ message: 'm' });
    expect(error.getStatus()).toBe(418);
    expect(error.cause).toBe('c');
    expect(error.stack).toBeUndefined();
    expect(Reflect.get(error, 'originalStack')).toBeDefined();
  });

  it('restores generic errors with custom properties', () => {
    const error = deserializer.deserialize({ name: 'MyError', message: 'm', code: 42 }) as any;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('MyError');
    expect(error.code).toBe(42);
  });

  it('restores Unknown records', () => {
    expect(deserializer.deserialize({ name: 'Unknown', message: '{"a":1}' })).toEqual({ a: 1 });
    const e = deserializer.deserialize({ name: 'Unknown', message: 'not json' }) as Error;
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('not json');
  });

  it('round trips a serialized http exception', () => {
    const original = new ConflictException('dup');
    const restored = deserializer.deserialize(new ErrorSerializer().serialize(original)) as HttpException;
    expect(restored).toBeInstanceOf(ConflictException);
    expect(restored.getStatus()).toBe(409);
  });
});

describe('RabbitMqIncomingRequestDeserializer', () => {
  const d = new RabbitMqIncomingRequestDeserializer();
  const options = { properties: { correlationId: 'id' }, fields: { routingKey: 'rk' } };

  it('passes nest packets through', () => {
    const packet = { pattern: 'p', data: 1 };
    expect(d.deserialize(packet, options)).toBe(packet);
    expect(d.isExternal({ data: 1 })).toBe(false);
  });

  it('maps external messages using properties and fields', () => {
    expect(d.deserialize({ foo: 1 }, options)).toEqual({ id: 'id', pattern: 'rk', data: { foo: 1 } });
    expect(d.isExternal(null)).toBe(true);
  });

  it('maps to an empty packet without options', () => {
    expect(d.mapToSchema({ foo: 1 })).toEqual({ pattern: undefined, data: undefined });
  });
});

describe('IncomingResponseDeserializer', () => {
  const d = new IncomingResponseDeserializer();

  it('wraps external responses', () => {
    expect(d.deserialize({ id: 'x', a: 1 })).toEqual({ id: 'x', response: { id: 'x', a: 1 }, isDisposed: true });
    expect(d.deserialize(null)).toEqual({ id: null, response: null, isDisposed: true });
  });

  it('passes nest responses through', () => {
    const packet = { response: 1 };
    expect(d.deserialize(packet)).toBe(packet);
    expect(d.isExternal({ isDisposed: true })).toBe(false);
  });

  it('deserializes the serialized error of a response', () => {
    const res = d.deserialize({ err: { name: 'NotFoundException', message: 'x', status: 404, response: 'x' } });
    expect(res.err).toBeInstanceOf(NotFoundException);
  });
});
