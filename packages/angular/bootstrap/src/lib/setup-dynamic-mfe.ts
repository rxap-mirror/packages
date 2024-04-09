import {
  setRemoteDefinitions,
  setRemoteUrlResolver,
} from '@nx/angular/mf';
import {
  DetermineReleaseName,
  Environment,
} from '@rxap/environment';

export async function SetupDynamicMfe(environment: Environment) {

  const manifest = environment.moduleFederation?.manifest;

  if (!manifest) {
    setRemoteUrlResolver((remoteName: string) => `${location.origin}/__mfe/${DetermineReleaseName(environment, 'latest')}/${remoteName}`);
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
