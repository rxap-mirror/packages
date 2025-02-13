import {
  formatFiles,
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  ApplicationInitProject,
  ApplicationInitWorkspace,
} from '@rxap/plugin-application';
import {
  classify,
  CoerceArrayItems,
  dasherize,
  DeleteProperties,
} from '@rxap/utilities';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceFile,
  CoerceFilesStructure,
  GenerateSerializedSchematicFile,
  GetProjectPrefix,
  GetProjectRoot,
  GetProjectSourceRoot,
  SkipNonAngularProject,
  SkipNonApplicationProject,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { ANGULAR_VERSION } from '../../lib/angular-version';
import { coerceTestSetup } from '../../lib/coerce-test-setup';
import { cleanup } from './cleanup';
import { coerceAppConfig } from './coerce-app-config';
import { coerceEnvironmentFiles } from './coerce-environment-files';
import { coerceLocalazyConfigFile } from './coerce-localazy-config-file';
import { CoerceProjects } from './coerce-project';
import { generateAuthentication } from './generate-authentication';
import { generateMonolithic } from './generate-monolithic';
import { linkMfeRemoteWithHost } from './link-mfe-remote-with-host';
import {
  InitApplicationGeneratorSchema,
  InitApplicationModuleFederationGeneratorSchemaEnum,
} from './schema';
import { updateGitIgnore } from './update-git-ignore';
import { updateMainFile } from './update-main-file';
import { updateProjectTargets } from './update-project-targets';
import { updateTags } from './update-tags';
import { updateTargetDefaults } from './update-target-defaults';
import { updateTsConfig } from './update-ts-config';

function skipProject(tree: Tree, options: InitApplicationGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  if (options.authentik) {
    options.oauth = true;
  }
  if (options.monolithic) {
    options.openApi = true;
  }
  if (options.i18n) {
    options.languages ??= ['en'];
  }
  if (options.project) {
    options.projects ??= [];
    CoerceArrayItems(options.projects, [options.project]);
  }
  if (options.host) {
    options.moduleFederation = InitApplicationModuleFederationGeneratorSchemaEnum.REMOTE;
  }
  if (options.moduleFederation === 'remote') {
    options.authentication = false;
    options.oauth = false;
    options.authentik = false;
    options.serviceWorker = false;
    options.sentry = false;
    options.monolithic = false;
  }
  console.log('angular application init generator:', options);

  await ApplicationInitWorkspace(tree, options);

  await AddPackageJsonDependency(tree, '@mdi/angular-material', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-bootstrap', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'ngx-logger', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/environment', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-status-check', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-error', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-localize', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/ngx-changelog', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'ngx-markdown', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'marked', '4.3.0', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/config', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/directives', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/components', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/rxjs', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/data-grid', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/forms', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/validator', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/pipes', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/mixin', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/reflect-metadata', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/browser-tailwind', 'latest', { soft: true, withoutNonRxapPeerDependencies: false });
  // must always be added as some rxap components use the i18n tag
  await AddPackageJsonDependency(tree, '@angular/localize', ANGULAR_VERSION, { soft: true });
  // must always be added as some rxap components use interfaces from the package
  // TODO : refactor the @rxap/ngx-error and @rxap/ngx-status-check to be independent from the @sentry/angular package
  await AddPackageJsonDependency(tree, '@sentry/angular', 'latest', { soft: true });

  if (options.oauth) {
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, 'angular-oauth2-oidc-jwks', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/oauth', 'latest', { soft: true });
  }

  if (options.material) {
    await AddPackageJsonDependency(tree, '@angular/material', ANGULAR_VERSION, { soft: true });
    await AddPackageJsonDependency(tree, '@angular/cdk', ANGULAR_VERSION, { soft: true });
  }

  if (options.serviceWorker) {
    await AddPackageJsonDependency(tree, '@rxap/service-worker', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/life-cycle', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@angular/service-worker', ANGULAR_VERSION, { soft: true });
  }

  if (options.monolithic) {
    await AddPackageJsonDependency(tree, '@rxap/layout', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-theme', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@ctrl/tinycolor', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-pub-sub', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/services', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/data-source', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/pattern', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/definition', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/authentication', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/icon', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/material-directives', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/browser-utilities', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/authorization', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-user', 'latest', { soft: true });
  }

  if (options.openApi) {
    await AddPackageJsonDependency(tree, '@rxap/open-api', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/remote-method', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/definition', 'latest', { soft: true });
  }

  if (options.sentry) {
    await AddPackageJsonDependency(tree, '@rxap/ngx-sentry', 'latest', { soft: true });
  }

  if (options.i18n) {
    await AddPackageJsonDependency(tree, '@rxap/ngx-localize', 'latest', { soft: true });
    await AddPackageJsonDependency(tree, '@rxap/ngx-user', 'latest', { soft: true });
  }

  if (options.localazy) {
    await AddPackageJsonDevDependency(tree, '@localazy/cli', 'latest', { soft: true });
    await AddPackageJsonDevDependency(tree, '@rxap/plugin-localazy', 'latest', { soft: true });
  }

  if (options.deploy === 'web3-storage') {
    await AddPackageJsonDevDependency(tree, '@rxap/plugin-web3-storage', 'latest', { soft: true });
  }

  if (options.i18n && options.deploy === 'web3-storage') {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'i18n'),
      target: 'shared/angular',
      overwrite: options.overwrite,
    });
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'shared'),
    target: 'shared/angular',
    overwrite: options.overwrite,
  });

  CoerceFile(tree, 'shared/angular/assets/custom.svg', '<svg></svg>');

  if (options.i18n && !options.skipDocker) {
    let dockerfileContent = tree.read('shared/angular/Dockerfile', 'utf-8')!;
    dockerfileContent = dockerfileContent.replace('registry.gitlab.com/rxap/docker/nginx:', 'registry.gitlab.com/rxap/docker/i18n-nginx:');
    CoerceFile(tree, 'shared/angular/Dockerfile', dockerfileContent, true);
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'styles'),
    target: 'shared/angular/styles',
    overwrite: options.overwrite,
  });

  if (options.oauth) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'oauth'),
      target: 'shared/angular/assets',
      overwrite: options.overwrite,
    });
  }

  updateTargetDefaults(tree, options);

  await CoerceProjects(tree, options);

  if (!options.skipProjects) {
    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-angular',
        'init-application',
        DeleteProperties(options, [ 'generateMain' ]),
      );

      console.log(`init angular application project: ${ projectName }`);

      const sourceRoot = GetProjectSourceRoot(tree, projectName);

      ApplicationInitProject(tree, projectName, project, options);

      if (options.overwrite || !tree.read(join(sourceRoot, 'styles.scss'), 'utf-8')?.match(/@use ".+\/shared\/angular\/styles";/)) {
        generateFiles(tree, join(__dirname, 'files', 'root'), sourceRoot, {
          serviceWorker: false,
          ...options,
          relativePathToWorkspaceRoot: relative(sourceRoot, ''),
          name: projectName.replace(/^user-interface-/, ''),
          classify,
          prefix: GetProjectPrefix(tree, projectName, 'rxap'),
        });
      }

      if (options.overwrite) {
        const publicDirectory = join(sourceRoot, 'public');
        const usePublicDirectory = tree.exists(publicDirectory);
        const baseDirectory = usePublicDirectory ? publicDirectory : sourceRoot;
        generateFiles(tree, join(__dirname, 'files', 'public'), baseDirectory, {});
      }

      updateProjectTargets(tree, projectName, project, options);
      updateTags(project, options);
      updateGitIgnore(project, tree, options);
      updateTsConfig(tree, projectName);

      if (options.cleanup || options.coerce) {
        cleanup(tree, projectName, options);
      }

      coerceEnvironmentFiles(
        tree,
        {
          ...options,
          project: projectName,
        },
      );

      coerceAppConfig(tree, projectName, options);

      if (options.generateMain) {
        updateMainFile(tree, projectName, project, options);
      }
      if (options.localazy) {
        coerceLocalazyConfigFile(tree, project);
      }
      if (options.authentication) {
        await generateAuthentication(tree, projectName, project, options);
      }
      if (options.monolithic) {
        generateMonolithic(tree, projectName, project, options);
      }
      if (options.moduleFederation === 'remote') {
        if (options.overwrite) {
          generateFiles(tree, join(__dirname, 'files', 'mfe-remote'), sourceRoot, {
            ...options,
            relativePathToWorkspaceRoot: relative(sourceRoot, ''),
            name: projectName
              .replace(/^user-interface-/, '')
              .replace(/^remote-/, '')
              .replace(/^feature-/, ''),
            classify,
            dasherize,
            prefix: GetProjectPrefix(tree, projectName, 'rxap'),
          });
        }
        if (options.host) {
          linkMfeRemoteWithHost(tree, projectName, options);
        }
      }
      if (options.moduleFederation) {
        CoerceFilesStructure(tree, {
          srcFolder: join(__dirname, 'files', 'mfe'),
          target: '',
          overwrite: options.overwrite,
        });
      }
      if (options.serviceWorker) {
        const publicDirectory = join(sourceRoot, 'public');
        const usePublicDirectory = tree.exists(publicDirectory);
        const baseDirectory = usePublicDirectory ? publicDirectory : sourceRoot;
        if (options.overwrite || !tree.exists(join(baseDirectory, 'manifest.webmanifest'))) {
          generateFiles(tree, join(__dirname, 'files', 'service-worker'), baseDirectory, {
            ...options,
            name: projectName.replace(/^user-interface-/, ''),
            classify,
            dasherize,
          });
        }
      }

      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files', 'assets'),
        target: join(sourceRoot, 'assets'),
        overwrite: options.overwrite,
      });
      coerceTestSetup(tree, projectName);

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);

    }
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initApplicationGenerator;
