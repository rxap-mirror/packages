import { Environment } from './environment';

/**
 * Loads the build.json and adds all keys to the environment object
 */
export async function UpdateEnvironment(environment: Environment, url = 'build.json') {
  await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Could not load build.json');
      }
      return response.json();
    })
    .then((build) => Object.assign(environment, build))
    .catch(error => console.error(error.message));
  console.debug(`environment: '${ environment.name }'`, environment);
}
