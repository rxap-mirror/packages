import { isUndefined } from '@nestjs/common/utils/shared.utils';
import {
  ConsumerDeserializer,
  IncomingEvent,
  IncomingRequest,
} from '@nestjs/microservices';

export class RabbitMqIncomingRequestDeserializer implements ConsumerDeserializer {
  deserialize(
    value: any,
    options?: { properties: Record<string, any>, fields: Record<string, any> },
  ): IncomingRequest | IncomingEvent {
    return this.isExternal(value) ? this.mapToSchema(value, options) : value;
  }

  isExternal(value: any): boolean {
    if (!value) {
      return true;
    }
    if (
      !isUndefined((value as IncomingRequest).pattern) ||
      !isUndefined((value as IncomingRequest).data)
    ) {
      return false;
    }
    return true;
  }

  mapToSchema(
    value: any,
    options?: { properties: Record<string, any>, fields: Record<string, any> },
  ): IncomingRequest | IncomingEvent {
    if (!options) {
      return {
        pattern: undefined,
        data: undefined,
      };
    }
    return {
      id: options.properties['correlationId'],
      pattern: options.fields['routingKey'],
      data: value,
    };
  }
}
