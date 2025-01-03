import { isUndefined } from '@nestjs/common/utils/shared.utils';
import {
  IncomingResponse,
  ProducerDeserializer,
} from '@nestjs/microservices';
import { ErrorDeserializer } from './error.deserializer';

export class IncomingResponseDeserializer implements ProducerDeserializer {
  deserialize(value: any, options?: Record<string, any>): IncomingResponse {
    if (this.isExternal(value)) {
      return this.mapToSchema(value);
    } else {
      if (!isUndefined((
        value as IncomingResponse
      ).err)) {
        value['err'] = new ErrorDeserializer().deserialize(value['err']);
      }
      return value;
    }
  }

  isExternal(value: any): boolean {
    if (!value) {
      return true;
    }
    if (
      !isUndefined((
        value as IncomingResponse
      ).err) ||
      !isUndefined((
        value as IncomingResponse
      ).response) ||
      !isUndefined((
        value as IncomingResponse
      ).isDisposed)
    ) {
      return false;
    }
    return true;
  }

  mapToSchema(value: any): IncomingResponse {
    return {
      id: value && value.id,
      response: value,
      isDisposed: true,
    };
  }
}
