import { HttpException } from '@nestjs/common';
import { SerializedError } from './serialized-error';

export class ErrorSerializer {

  serialize(error: Error | unknown): SerializedError {

    if (!(
      error instanceof Error
    )) {
      return {
        message: this.stringifyCircular(error),
        name: 'Unknown',
      };
    }

    const serializedError: SerializedError = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    if (error instanceof HttpException) {
      serializedError['response'] = error.getResponse();
      serializedError['status'] = error.getStatus();
      serializedError['cause'] = error.cause;
    }

    return serializedError;

  }

  protected stringifyCircular(obj: any) {
    const seenObjects = new Set();

    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seenObjects.has(value)) {
          // Detected a circular reference, replace it with a custom string or value
          return '[Circular]';
        }
        seenObjects.add(value);
      }
      return value;
    });
  }

}
