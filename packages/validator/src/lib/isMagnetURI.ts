import { assertString } from './util/assertString';

const magnetURI = /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+$/i;

export function isMagnetURI(url: unknown) {
  assertString(url);
  return magnetURI.test(url.trim());
}
