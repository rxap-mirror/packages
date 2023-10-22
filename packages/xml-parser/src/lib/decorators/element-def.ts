import {
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';
import { ElementParserMetaData } from './metadata-keys';

export function ElementDef(tag: string) {
  return function (target: any) {
    target.TAG = tag;
    // TODO : remove deprecated
    setMetadata(ElementParserMetaData.NAME, tag, target);
    if (!hasMetadata(ElementParserMetaData.PARSER, target)) {
      setMetadata(ElementParserMetaData.PARSER, [], target);
    }
  };
}
