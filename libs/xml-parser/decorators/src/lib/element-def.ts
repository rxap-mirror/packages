import { XmlElementMetadata } from './utilities';
import {
  setMetadata,
  hasMetadata
} from '@rxap/utilities/reflect-metadata';

export function ElementDef(tag: string) {
  return function(target: any) {
    target.TAG = tag;
    // TODO : remove deprecated
    setMetadata(XmlElementMetadata.NAME, tag, target);
    if (!hasMetadata(XmlElementMetadata.PARSER, target)) {
      setMetadata(XmlElementMetadata.PARSER, [], target);
    }
  };
}
