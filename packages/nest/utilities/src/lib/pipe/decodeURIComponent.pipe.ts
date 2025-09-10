import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DecodeURIComponentPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return decodeURIComponent(value);
  }
}
