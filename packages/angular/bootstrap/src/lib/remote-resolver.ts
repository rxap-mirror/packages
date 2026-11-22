/**
 * Minimal runtime registry for the urls of module federation remotes.
 *
 * Replaces the `setRemoteDefinitions` / `setRemoteUrlResolver` helpers formerly imported from
 * `@nx/angular/mf`, which was removed with the webpack module federation support in Nx 24.
 */
let remoteUrlDefinitions: Record<string, string> = {};
let remoteUrlResolver: ((remoteName: string) => string) | null = null;

/**
 * Registers a map of remote name to remote url (usually the content of a manifest file).
 */
export function setRemoteDefinitions(definitions: Record<string, string>): void {
  remoteUrlDefinitions = definitions;
}

/**
 * Registers a function used to resolve the url of a remote that is not part of the registered definitions.
 */
export function setRemoteUrlResolver(resolver: (remoteName: string) => string): void {
  remoteUrlResolver = resolver;
}

/**
 * Returns the url of the remote. Registered definitions take precedence over the url resolver.
 *
 * @throws if neither a definition nor a url resolver is available for the remote
 */
export function getRemoteUrl(remoteName: string): string {
  const url = remoteUrlDefinitions[remoteName] ?? remoteUrlResolver?.(remoteName);
  if (!url) {
    throw new Error(`Cannot find the url of the remote '${ remoteName }'. Register it with setRemoteDefinitions or setRemoteUrlResolver.`);
  }
  return url;
}
