/**
 * Determines if a given project is an Angular project based on its tags.
 *
 * This function checks if the 'tags' property of the project object includes either 'angular' or 'ngx'.
 * It returns true if either of these tags is present, indicating it is an Angular project, otherwise it returns false.
 *
 * @param {Object} project - The project object to check.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - True if the project is an Angular project, false otherwise.
 */
export function IsAngularProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('angular') || !!project.tags?.includes('ngx');
}

/**
 * Determines if a given project is an Angular project using Angular Material.
 *
 * This function checks if the project is an Angular project and if it includes 'material' in its tags.
 *
 * @param {Object} project - The project to check, which should have an optional `tags` property.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 *
 * @returns {boolean} - Returns `true` if the project is an Angular project and includes 'material' in its tags, otherwise returns `false`.
 */
export function IsAngularMaterialProject(project: { tags?: string[] }): boolean {
  return IsAngularProject(project) && !!project.tags?.includes('material');
}

/**
 * Determines if a given project is a NestJS project based on its tags.
 *
 * This function checks if the 'tags' property of the project object includes either 'nest' or 'nestjs'.
 * It returns true if either of these tags is present, indicating it is a NestJS project, otherwise it returns false.
 *
 * @param {Object} project - An object representing a project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of strings representing tags associated with the project.
 * @returns {boolean} - True if the project is a NestJS project, false otherwise.
 */
export function IsNestJsProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('nest') || !!project.tags?.includes('nestjs');
}

/**
 * Determines if the specified project is categorized as a plugin project based on its tags.
 *
 * @param {Object} project - An object representing the project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - Returns `true` if the 'tags' array contains the string 'plugin', otherwise returns `false`.
 */
export function IsPluginProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('plugin');
}

export function IsN8NProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('n8n');
}

/**
 * Determines if the given project is categorized as a 'preset' by checking the presence of the 'preset' tag in its tags array.
 *
 * @param {Object} project - An object representing a project, which may optionally have a 'tags' array.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - Returns `true` if the 'preset' tag is found in the project's tags array, otherwise returns `false`.
 */
export function IsPresetProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('preset');
}

/**
 * Determines if the given project is a schematic project based on its tags.
 *
 * This function checks if the 'schematic' tag is present in the project's tags array.
 * It returns true if the tag is found, indicating it is a schematic project, otherwise false.
 *
 * @param {Object} project - The project object to check, which may optionally have a 'tags' array.
 * @returns {boolean} - True if the project has a 'schematic' tag, otherwise false.
 */
export function IsSchematicProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('schematic');
}

/**
 * Determines if a given project is classified as an internal project based on its tags.
 *
 * This function checks if the 'internal' tag is present in the project's tags array. It returns true if the tag is found, indicating the project is internal; otherwise, it returns false.
 *
 * @param {Object} project - The project object to check.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - True if the project has the 'internal' tag, false otherwise.
 */
export function IsInternalProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('internal');
}

/**
 * Determines if the specified project is categorized as a 'generator' project based on its tags.
 *
 * @param {Object} project - An object representing the project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - Returns `true` if the 'generator' tag is present in the project's tags, otherwise returns `false`.
 */
export function IsGeneratorProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('generator');
}

/**
 * Determines if the given project is a Node.js project based on its tags.
 *
 * This function checks if the 'node' tag is present in the project's tags array.
 * It returns true if the 'node' tag is found, indicating it is a Node.js project, otherwise it returns false.
 *
 * @param {Object} project - An object representing a project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - True if the project includes 'node' in its tags, false otherwise.
 */
export function IsNodeProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('node');
}

/**
 * Determines if the given project is categorized under 'utilities'.
 *
 * This function checks if the 'utilities' tag is present in the project's tags array.
 * It safely handles cases where the project may not have any tags defined.
 *
 * @param {Object} project - The project object to check.
 * @param {string[]} [project.tags] - Optional array of tag strings associated with the project.
 * @returns {boolean} - Returns `true` if the 'utilities' tag is found, otherwise returns `false`.
 */
export function IsUtilitiesProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('utilities');
}

/**
 * Determines if the given project is categorized as a workspace project based on its tags.
 *
 * This function checks if the 'workspace' tag is included in the project's tags array. It returns true if the tag is present, otherwise false.
 *
 * @param {Object} project - An object representing a project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of tags associated with the project.
 * @returns {boolean} - True if the 'workspace' tag is found in the project's tags, otherwise false.
 */
export function IsWorkspaceProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('workspace');
}

/**
 * Determines if the given project is related to data structures.
 *
 * This function checks if the 'data-structure' tag is present in the project's tags array.
 * It safely handles cases where the tags array might be undefined by using optional chaining.
 *
 * @param {Object} project - An object representing a project, which may have a 'tags' property.
 * @param {string[]} [project.tags] - Optional array of tag strings associated with the project.
 * @returns {boolean} - Returns `true` if the 'data-structure' tag is found, otherwise returns `false`.
 */
export function IsDataStructureProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('data-structure');
}

/**
 * Determines if the given project is an application project.
 *
 * This function checks if the `projectType` property of the provided project object
 * is explicitly set to 'application'. It returns true if the condition is met, indicating
 * that the project is an application project, otherwise it returns false.
 *
 * @param {Object} project - An object representing a project, which may optionally have a `projectType` property.
 * @param {string} [project.projectType] - The type of the project, which should be 'application' for application projects.
 * @returns {boolean} - True if the project's type is 'application', otherwise false.
 */
export function IsApplicationProject(project: { projectType?: string }): boolean {
  return project.projectType === 'application';
}

/**
 * Determines if the given project is of type 'library'.
 *
 * This function checks if the `projectType` property of the provided `project` object
 * is exactly equal to the string 'library'. It is used to identify projects that are specifically
 * categorized as libraries.
 *
 * @param {Object} project - An object representing a project, which may optionally have a `projectType` property.
 * @param {string} [project.projectType] - The type of the project, which is optional.
 *
 * @returns {boolean} - Returns `true` if the `projectType` of the project is 'library', otherwise returns `false`.
 */
export function IsLibraryProject(project: { projectType?: string }): boolean {
  return project.projectType === 'library';
}

/**
 * Determines if a given project is categorized as a User Interface project.
 *
 * This function checks if the project is an application project and if it either includes a 'user-interface' tag
 * or qualifies as an Angular project.
 *
 * @param project An object representing the project, which may contain:
 * - tags: an optional array of strings representing various tags associated with the project.
 * - projectType: an optional string indicating the type of the project.
 * @returns true if the project is an application project and meets the additional criteria of having a 'user-interface' tag
 * or being an Angular project; otherwise, returns false.
 */
export function IsUserInterfaceProject(project: { tags?: string[], projectType?: string }) {
  return IsApplicationProject(project) && (
    !!project.tags?.includes('user-interface') || IsAngularProject(project)
  );
}

/**
 * Determines if a given project is classified as a service project.
 * A project is considered a service project if it meets the criteria of being an application project
 * and either includes the 'service' tag or is identified as a NestJS project.
 *
 * @param {object} project - The project to evaluate, which can optionally include:
 * - {string[]} tags - An array of tags associated with the project.
 * - {string} projectType - The type of the project.
 * @returns {boolean} - Returns `true` if the project is a service project, otherwise `false`.
 */
export function IsServiceProject(project: { tags?: string[], projectType?: string }) {
  return IsApplicationProject(project) && (
    !!project.tags?.includes('service') || IsNestJsProject(project)
  );
}

export function IsN8nProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('n8n');
}
