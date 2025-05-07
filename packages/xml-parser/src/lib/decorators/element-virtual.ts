import { setMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './metadata-keys';

export function ElementVirtual() {
  return function (target: any) {
    setMetadata(ElementParserMetaData.VIRTUAL, true, target);
  };
}
