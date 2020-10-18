import {
  setMetadata,
  hasMetadata
} from '@rxap/utilities';
import { XmlElementMetadata } from './utilities';

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
