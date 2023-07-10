import {
  getProjects,
  Tree,
} from '@nx/devkit';

export function GetProject(tree: Tree, projectName: string) {
  const projects = getProjects(tree);
  return projects.get(projectName);
}

export function HasProject(tree: Tree, projectName: string) {
  return !!GetProject(tree, projectName);
}

export function GetProjectRoot(tree: Tree, projectName: string) {
  const project = GetProject(tree, projectName);
  if (!project) {
    throw new Error(`Project ${projectName} not found!`);
  }
  return project.root;
}

export function GetProjectSourceRoot(tree: Tree, projectName: string) {
  const project = GetProject(tree, projectName);
  if (!project) {
    throw new Error(`Project ${projectName} not found!`);
  }
  return project.sourceRoot;
}
