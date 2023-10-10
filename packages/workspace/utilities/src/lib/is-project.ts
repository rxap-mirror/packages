export function IsAngularProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('angular') || !!project.tags?.includes('ngx');
}

export function IsAngularMaterialProject(project: { tags?: string[] }): boolean {
  return IsAngularProject(project) && !!project.tags?.includes('material');
}

export function IsNestJsProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('nest') || !!project.tags?.includes('nestjs');
}

export function IsPluginProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('plugin');
}

export function IsSchematicProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('schematic');
}

export function IsInternalProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('internal');
}

export function IsGeneratorProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('generator');
}

export function IsNodeProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('node');
}

export function IsUtilitiesProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('utilities');
}

export function IsWorkspaceProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('workspace');
}

export function IsDataStructureProject(project: { tags?: string[] }): boolean {
  return !!project.tags?.includes('data-structure');
}

export function IsApplicationProject(project: { projectType?: string }): boolean {
  return project.projectType === 'application';
}

export function IsLibraryProject(project: { projectType?: string }): boolean {
  return project.projectType === 'library';
}

export function IsUserInterfaceProject(project: { tags?: string[], projectType?: string }) {
  return IsApplicationProject(project) && (
    !!project.tags?.includes('user-interface') || IsAngularProject(project)
  );
}

export function IsServiceProject(project: { tags?: string[], projectType?: string }) {
  return IsApplicationProject(project) && (
    !!project.tags?.includes('service') || IsNestJsProject(project)
  );
}
