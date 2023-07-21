import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/schematics-utilities';
import { HasProjectFeature } from './has-project-feature';
import { join } from 'path';

export interface HasAccordionComponentOptions {
  accordionName: string;
  project: string;
  feature?: string;
}

export function HasAccordionComponent(
  host: Tree,
  options: HasAccordionComponentOptions,
): boolean {
  const {
    accordionName,
    project,
    feature,
  } = options;
  if (!HasProject(host, project)) {
    throw new SchematicsException(`The accordion component '${ accordionName }' does not exists. The project '${ project }' does not exists.`);
  }
  if (!HasProjectFeature(host, options)) {
    throw new SchematicsException(`The accordion component '${ accordionName }' does not exists. The project '${ project }' has not the feature does not exists.`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, options.project);
  if (feature) {
    return host.exists(join(projectSourceRoot, 'feature', feature, accordionName, accordionName + '.component.ts'));
  } else {
    return host.exists(join(projectSourceRoot, 'app', accordionName, accordionName + '.component.ts'));
  }
}
