import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';
import { IsPublishable } from './is-publishable';

export interface SkipProjectOptions {
  projects?: string[];
}

export function SkipProject(
  tree: Tree,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (options.projects?.length && !options.projects?.includes(projectName)) {
    return true;
  }

  if (project.tags?.includes('internal')) {
    return true;
  }

  if (!tree.exists(join(project.root, 'project.json'))) {
    console.warn(`The project ${ projectName } has no project.json file.`);
    return true;
  }

  return false;

}

export function SkipNonLibraryProject(
  tree: Tree,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }

  if (project.projectType !== 'library') {
    return true;
  }

  return false;

}

export function SkipNonBuildableProject(
  tree: Tree,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsBuildable(project)) {
    return true;
  }

  return false;

}

export function SkipNonPublishableProject(
  tree: Tree,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonBuildableProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsPublishable(tree, project)) {
    return true;
  }

  return false;

}

export function SkipNonApplicationProject(
  tree: Tree,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }

  if (project.projectType !== 'application') {
    return true;
  }

  if (!project.targets?.['build']) {
    return true;
  }

  return false;

}
