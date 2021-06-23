import { Rule } from '@angular-devkit/schematics';
import { InstallPeerDependencies } from '@rxap/schematics-utilities';

export default function(): Rule {
  return InstallPeerDependencies();
}
