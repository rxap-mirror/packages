import {assertString} from './util/assertString';
import {isIP} from './isIP';

const subnetMaybe = /^\d{1,3}$/;
const v4Subnet = 32;
const v6Subnet = 128;

export function isIPRange(str: unknown, version = '') {
  assertString(str);
  const parts = str.split('/');
  const ip: string = parts[0];

  // parts[0] -> ip, parts[1] -> subnet
  if (parts.length !== 2) {
    return false;
  }

  if (!subnetMaybe.test(parts[1])) {
    return false;
  }

  // Disallow preceding 0 i.e. 01, 02, ...
  if (parts[1].length > 1 && parts[1].startsWith('0')) {
    return false;
  }

  const isValidIP = isIP(ip, version);
  if (!isValidIP) {
    return false;
  }

  const subnet = Number(parts[1]);

  // Define valid subnet according to IP's version
  let expectedSubnet: number | null = null;
  switch (String(version)) {
    case '4':
      expectedSubnet = v4Subnet;
      break;

    case '6':
      expectedSubnet = v6Subnet;
      break;

    default:
      expectedSubnet = isIP(ip, '6') ? v6Subnet : v4Subnet;
  }

  return subnet <= expectedSubnet && subnet >= 0;
}
