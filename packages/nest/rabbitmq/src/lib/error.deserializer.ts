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
import { SerializedError } from './serialized-error';

export class ErrorDeserializer {

  deserialize(record: SerializedError): Error | unknown {

    let error: Error;

    switch (record.name) {

      default:
        error = new Error(record.message);
        error.name = record.name;
        // Reattach any custom properties
        Object.assign(error, record);
        break;

      case 'Unknown':
        try {
          return JSON.parse(record.message);
        } catch {
          return new Error(record.message);
        }

      case 'BadGatewayException':
        error = new BadGatewayException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'BadRequestException':
        error = new BadRequestException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'ConflictException':
        error = new ConflictException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'ForbiddenException':
        error = new ForbiddenException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'GatewayTimeoutException':
        error = new GatewayTimeoutException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'GoneException':
        error = new GoneException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'HttpVersionNotSupportedException':
        error = new HttpVersionNotSupportedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'ImATeapotException':
        error = new ImATeapotException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'InternalServerErrorException':
        error = new InternalServerErrorException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'MethodNotAllowedException':
        error = new MethodNotAllowedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'MisdirectedException':
        error = new MisdirectedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'NotAcceptableException':
        error = new NotAcceptableException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'NotFoundException':
        error = new NotFoundException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'NotImplementedException':
        error = new NotImplementedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'PayloadTooLargeException':
        error = new PayloadTooLargeException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'PreconditionFailedException':
        error = new PreconditionFailedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'RequestTimeoutException':
        error = new RequestTimeoutException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'ServiceUnavailableException':
        error = new ServiceUnavailableException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'UnauthorizedException':
        error = new UnauthorizedException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'UnprocessableEntityException':
        error = new UnprocessableEntityException();
        this.deserializeHttpException(record, error as HttpException);
        break;

      case 'UnsupportedMediaTypeException':
        error = new UnsupportedMediaTypeException();
        this.deserializeHttpException(record, error as HttpException);
        break;

    }

    Reflect.set(error, 'originalStack', error.stack);
    Reflect.set(error, 'stack', undefined);

    return error;

  }

  private deserializeHttpException<T extends HttpException>(record: SerializedError, error: T): void {
    error.name = record.name;
    error.message = record.message;
    error.cause = record['cause'];
    Reflect.set(error, 'response', record['response']);
    Reflect.set(error, 'status', record['status']);
  }

}
