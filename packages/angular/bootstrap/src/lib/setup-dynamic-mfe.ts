import type { Environment } from '@rxap/environment';
import {
  setRemoteDefinitions,
  setRemoteUrlResolver,
} from './remote-resolver';

/**
 * @deprecated It is not possible to use the `import` statement in the `main.ts` file. This results in a runtime error.
 * @param environment
 */
export async function SetupDynamicMfe(environment: Environment) {

  const manifest = environment.moduleFederation?.manifest;

  if (!manifest) {
    const release = environment.tag || environment.branch || 'latest';
    setRemoteUrlResolver((remoteName: string) => `${location.origin}/__mfe/${release}/${remoteName}`);
  } else {

    let definitions: Record<string, string>;

    if (typeof manifest === 'object') {
      definitions = manifest;
    } else {
      definitions = await fetch(manifest).then((res) => res.json());
    }

    setRemoteDefinitions(definitions);

  }

}
