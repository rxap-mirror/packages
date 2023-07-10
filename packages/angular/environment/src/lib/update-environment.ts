/**
 * Loads the build.json and adds all keys to the environment object
 */
export function UpdateEnvironment(environment: any, url = '/build.json') {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Could not load build.json');
      }
      return response.json();
    })
    .then((build) => Object.assign(environment, build))
    .catch(error => console.error(error.message));
}
