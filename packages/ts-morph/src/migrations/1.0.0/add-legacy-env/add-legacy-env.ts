/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nx/devkit';

export default function update(host: Tree) {
  if (!host.exists('.env')) {
    host.write('.env', '');
  }
  let env = host.read('.env')!.toString('utf-8');

  if (!env.includes('RXAP_LEGACY_OPEN_API_CLIENT_SDK')) {
    env += '\nRXAP_LEGACY_OPEN_API_CLIENT_SDK=true\n';
    host.write('.env', env);
  }

}
