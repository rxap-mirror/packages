import { ProjectConfiguration } from '@nx/devkit';

/**
 * Ensures that the `tags` array in a given project configuration is unique and includes all specified tags.
 *
 * This function modifies the `tags` property of the `project` object by first ensuring it is initialized (if not already),
 * then appending the provided `tags`, and finally removing any duplicate entries to maintain uniqueness.
 *
 * @param {ProjectConfiguration} project - The project configuration object which contains a `tags` property that may be modified.
 * @param {string[]} tags - An array of tag strings to be added to the project's `tags` property.
 */
export function CoerceProjectTags(project: ProjectConfiguration, tags: string[]) {
  project.tags ??= [];
  project.tags.push(...tags);
  project.tags = [ ...new Set(project.tags) ];
}
