/**
 * Resolves a module request from the root of the workspace the schematic runs in.
 *
 * Packages installed by the user (the schematic collection itself, its peer dependencies, ...) are
 * dependencies of the workspace and not of this package. With an isolated node_modules layout (pnpm)
 * they are only resolvable from the workspace root, which is the working directory of the Angular CLI.
 *
 * @param request the module request, e.g. `@rxap/schematic-angular/package.json`
 * @param workspaceRoot the directory the resolution starts at
 * @returns the absolute path of the resolved module
 * @throws if the module can not be resolved
 */
export function ResolveFromWorkspace(request: string, workspaceRoot = process.cwd()): string {
  return require.resolve(request, { paths: [ workspaceRoot ] });
}
