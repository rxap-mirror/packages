import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  GetProjectSourceRoot,
} from '@rxap/generator-utilities';
import { IsRecord } from '@rxap/utilities';
import {
  GetRootDockerOptions,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { execSync } from 'child_process';
import 'colors';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as process from 'process';
import { stringify } from 'yaml';
import { DockerComposeGeneratorSchema } from './schema';

function getServiceApiPrefixFromDockerFile(name: string, host: Tree): string | null {
  const projectSourceRoot = GetProjectSourceRoot(host, name);
  if (!projectSourceRoot) {
    throw new Error(`The project ${ name } has no source root!`);
  }
  const DockerFilePath = join(projectSourceRoot, 'Dockerfile');
  if (!host.exists(DockerFilePath)) {
    return null;
  }
  const dockerFile = host.read(DockerFilePath)!.toString('utf-8');
  const match = dockerFile.match(/ENV GLOBAL_API_PREFIX[\s=]"([^"]+)"/);
  if (!match) {
    return null;
  }
  const globalApiPrefix = match[1];
  return '/' + globalApiPrefix;
}

function getServiceApiPrefixFromAppConfig(name: string, host: Tree): string | null {
  const projectSourceRoot = GetProjectSourceRoot(host, name);
  if (!projectSourceRoot) {
    throw new Error(`The project ${ name } has no source root!`);
  }
  const appConfigFilePath = join(projectSourceRoot, 'app/app.config.ts');
  if (!host.exists(appConfigFilePath)) {
    return null;
  }
  const appConfig = host.read(appConfigFilePath)!.toString('utf-8');
  const match = appConfig.match(
    /validationSchema\['GLOBAL_API_PREFIX']\s*=\s*Joi.string\(\).default\(\s*'([^']+)',?\s*\);/);
  if (!match) {
    return null;
  }
  const globalApiPrefix = match[1];
  return '/' + globalApiPrefix;
}

function getServiceApiPrefix(name: string, host: Tree) {
  const globalApiPrefix = getServiceApiPrefixFromAppConfig(name, host) ?? getServiceApiPrefixFromDockerFile(name, host);
  if (!globalApiPrefix) {
    console.warn(`The service ${ name } has no app.config.ts or the app.config.ts has no GLOBAL_API_PREFIX validation schema!`);
  }
  return globalApiPrefix ?? '/api/' + name;
}

function buildImageName(docker: Record<string, string>, rootDocker: RootDockerOptions): string {
  const imageRegistry = `\${REGISTRY:-${ docker.imageRegistry ?? rootDocker.imageRegistry }}`;
  const imageName = `${ docker.imageName ?? rootDocker.imageName }${ docker.imageSuffix ?? '' }`;
  const imageTag = `\${CHANNEL:-development}`;

  return `${ imageRegistry }/${ imageName }:${ imageTag }`;
}

function createServiceDockerCompose(
  services: Array<{ name: string; docker: Record<string, string> }>,
  rootDocker: RootDockerOptions,
  options: DockerComposeGeneratorSchema,
): string {
  return stringify({
    version: '3.8',
    services: services.reduce((
      services,
      {
        name,
        docker,
      },
    ) => {
      services[name] = {
        image: buildImageName(docker, rootDocker),
        labels: [
          'traefik.enable=true',
          // `traefik.http.services.${ name }.loadbalancer.server.port=3333`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.path=/health`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.interval=10s`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.timeout=3s`,
        ],
        environment: [
          ...options.serviceEnvironments ?? [],
          'STATUS_SERVICE_BASE_URL=http://rxap-status-service:3000',
          'ROOT_DOMAIN',
          'SENTRY_ENABLED=false',
          'LOG_LEVEL=verbose',
          'ROOT_DOMAIN_PORT',
        ],
        depends_on: [
          'traefik',
          'catch-all-api',
          'rxap-status-service',
        ],
      };
      return services;
    }, {} as Record<string, any>),
  });
}

function createFrontendDockerCompose(
  services: Array<{ name: string; docker: Record<string, string> }>,
  rootDocker: RootDockerOptions,
): string {
  return stringify({
    version: '3.8',
    services: services.reduce((
      services,
      {
        name,
        docker,
      },
    ) => {
      services[name] = {
        image: buildImageName(docker, rootDocker),
        labels: [
          'traefik.enable=true',
          // `traefik.http.routers.${ name }.entrypoints=https`,
          `traefik.http.routers.${ name }.rule=Host(\`${ name }.\${ROOT_DOMAIN}\`)`,
          // `traefik.http.services.${ name }.loadbalancer.server.port=80`,
          `traefik.http.routers.${ name }.priority=10`,
        ],
        depends_on: [
          'traefik',
          'rxap-service-configuration',
          'rxap-status-service',
          'catch-all-api',
        ],
      };
      return services;
    }, {} as Record<string, any>),
  });
}

function createDevServiceTraefikConfig(
  services: Array<{ name: string; docker: Record<string, string> }>,
  host: Tree,
): string {
  return stringify({
    http: {
      routers: services.reduce((routers, { name }) => {
        routers[name] = {
          rule: `PathPrefix(\`${ getServiceApiPrefix(name, host) }\`)`,
          priority: 100,
          service: name,
          entryPoints: 'https',
        };
        return routers;
      }, {} as Record<string, any>),
      services: services.reduce((services, { name }) => {
        const sourceRoot = GetProjectSourceRoot(host, name);
        if (!sourceRoot) {
          throw new Error(`The project ${ name } has no source root!`);
        }
        const appModuleFilePath = join(sourceRoot, 'app', 'app.config.ts');
        if (!host.exists(appModuleFilePath)) {
          throw new Error(`The project ${ name } has no app.module.ts!`);
        }
        const appModule = host.read(appModuleFilePath)!.toString('utf-8');
        const portMatch = appModule.match(
          /validationSchema\['PORT']\s*=\s*Joi.number\(\).default\((\d+)\)/,
        );
        if (!portMatch) {
          throw new Error(`The service ${ name } has no PORT environment variable!`);
        }
        const port = portMatch[1];
        services[name] = {
          failover: {
            service: name + '-local',
            fallback: name + '@docker',
          },
        };
        services[name + '-local'] = {
          loadBalancer: {
            healthCheck: {
              path: getServiceApiPrefix(name, host) + '/health',
              interval: '10s',
              timeout: '3s',
            },
            servers: [
              {
                url: `http://{{env "HOST_IP" }}:${ port }`,
              },
            ],
          },
        };
        return services;
      }, {} as Record<string, any>),
    },
  });
}

interface Application {
  name: string;
  tags: string[];
  docker: Record<string, string>;
}

function getApplications(tree: Tree, options: DockerComposeGeneratorSchema): Array<Application> {
  const projects = getProjects(tree);
  return Array.from(projects.entries())
              .filter(([ , project ]) => project.projectType === 'application')
              .filter(([ , project ]) => project.targets?.docker)
              .filter(([ projectName ]) => !options.ignoreProjects?.some((ignoreProject) => projectName ===
                ignoreProject))
              .map(([ name, project ]) => ({
                name,
                tags: project.tags ?? [],
                docker:
                  IsRecord(project.targets) && IsRecord(project.targets.docker)
                    ? project.targets.docker.options
                    : null,
              }))
              .filter((application) => IsRecord(application.docker));
}

function getFrontendApplications(applications: Application[], options: DockerComposeGeneratorSchema) {
  return applications.filter((application) => application.tags.includes('frontend') &&
    (options.tags ?? []).every(tag => application.tags.includes(tag)));
}

function getServiceApplications(applications: Application[], options: DockerComposeGeneratorSchema) {
  return applications.filter((application) => application.tags.includes('service') &&
    (options.tags ?? []).every(tag => application.tags.includes(tag)));
}

function createTraefikConfig(
  rootDomain: string,
  services: Array<{ name: string; docker: Record<string, string> }>,
  host: Tree,
) {
  return stringify({
    api: {
      dashboard: true,
      debug: true,
      insecure: true,
    },
    entryPoints: {
      http: {
        address: ':80',
        http: {
          redirections: {
            entrypoint: {
              to: 'https',
              scheme: 'https',
            },
          },
        },
      },
      https: {
        address: ':443',
        http: {
          tls: {
            domains: [
              {
                main: rootDomain,
                sans: services.map(({ name }) => name + '.' + rootDomain),
              },
            ],
          },
        },
      },
    },
    providers: {
      docker: {
        endpoint: 'unix:///var/run/docker.sock',
        exposedByDefault: false,
        network: 'traefik',
      },
      file: {
        directory: '/etc/traefik/dynamic',
      },
    },
    experimental: {
      plugins: {
        rewrite: {
          moduleName: 'github.com/traefik/plugin-rewritebody',
          version: 'v0.3.1',
        },
      },
    },
  });
}

function printEtcHostsConfig(
  rootDomain: string,
  services: Array<{ name: string; docker: Record<string, string> }>,
) {
  const config = [
    '127.0.0.1',
    'localhost',
    rootDomain,
    `traefik.${ rootDomain }`,
    `minio.${ rootDomain }`,
    `auth.${ rootDomain }`,
    ...services.map(({ name }) => name + '.' + rootDomain),
  ].join(
    ' ');
  console.log('Add the following line to your /etc/hosts file:'.blue);
  console.log(config);
  console.log('You can do this by running the following command:'.blue);
  console.log(`sudo sed -i 's/^127\\.0\\.0\\.1.*/${ config }/' /etc/hosts`.yellow);
}

function createExtCnf(
  rootDomain: string,
  services: Array<{ name: string; docker: Record<string, string> }>,
) {
  let config = `subjectAltName=DNS:${ rootDomain },DNS:traefik.${ rootDomain },DNS:minio.${ rootDomain },DNS:auth.${ rootDomain }`;
  if (services.length) {
    config += ',';
    config += services.map(({ name }) => 'DNS:' + name + '.' + rootDomain).join(',');
  }
  return config;
}

function createCaCrtSubj(rootDomain: string) {
  return `/C=DE/ST=NRW/L=Aachen/O=DigitAIX/OU=rxap/CN=${ rootDomain }`;
}

function createCertSubj(rootDomain: string) {
  return `/C=DE/ST=NRW/L=Aachen/O=DigitAIX/OU=rxap/CN=*.${ rootDomain }`;
}

function runOpensslCommand(tree: Tree, ...args: string[]) {
  const command = 'openssl ' + args.join(' ');
  console.log('RUN:', command);
  return execSync(command, {
    cwd: join(tree.root, 'docker/traefik/tls'),
  }).toString();
}

function coerceCaCert(rootDomain: string, tree: Tree) {
  if (tree.exists('docker/traefik/tls/ca.crt')) {
    return 'ca.crt already exists';
  }
  const subj = createCaCrtSubj(rootDomain);
  return runOpensslCommand(
    tree,
    'req',
    '-x509',
    '-nodes',
    '-newkey rsa:4096',
    '-days 3650',
    '-keyout ca.key',
    '-out ca.crt',
    `-subj "${ subj }"`,
  );
}

function createDefaultCerts(rootDomain: string, tree: Tree) {
  const subj = createCertSubj(rootDomain);
  return runOpensslCommand(
    tree,
    'req',
    '-new',
    '-newkey rsa:4096',
    '-nodes',
    '-keyout default.key',
    '-out default.csr',
    `-subj "${ subj }"`,
  );
}

function signDefaultCerts(
  rootDomain: string,
  services: Array<{ name: string; docker: Record<string, string> }>,
  tree: Tree,
) {
  const extCnf = createExtCnf(rootDomain, services);
  writeFileSync(join(tree.root, 'docker', 'traefik', 'tls', 'ext.cnf'), extCnf);
  return runOpensslCommand(
    tree,
    'x509',
    '-req',
    '-in default.csr',
    '-days 365',
    '-CA ca.crt',
    '-CAkey ca.key',
    '-CAcreateserial',
    '-out default.crt',
    '-extfile ext.cnf',
  );
}

function printSingedCert(tree: Tree) {
  console.log(runOpensslCommand(tree, 'x509', '-in default.crt', '-noout', '-text'));
}

function verifyCert(tree: Tree) {
  console.log(runOpensslCommand(tree, 'verify', '-CAfile ca.crt', 'default.crt'));
}

export async function dockerComposeGenerator(
  tree: Tree,
  options: DockerComposeGeneratorSchema,
) {

  const applications = getApplications(tree, options);
  const serviceApplications = getServiceApplications(applications, options);
  const frontendApplications = getFrontendApplications(applications, options);
  const rootDomain = options.rootDomain ?? process.env.ROOT_DOMAIN ?? '127-0-0-1.nip.io';

  const rootDocker = GetRootDockerOptions(tree);
  const serviceDockerCompose = createServiceDockerCompose(serviceApplications, rootDocker, options);
  const frontendDockerCompose = createFrontendDockerCompose(frontendApplications, rootDocker);
  const localServiceTraefikConfig = createDevServiceTraefikConfig(serviceApplications, tree);
  const traefikConfig = createTraefikConfig(rootDomain, frontendApplications, tree);

  CoerceFile(tree, 'docker-compose.services.yml', serviceDockerCompose, true);
  CoerceFile(tree, 'docker-compose.frontends.yml', frontendDockerCompose, true);
  if (serviceApplications.length) {
    CoerceFile(tree, 'docker/traefik/dynamic/local-services.yml', localServiceTraefikConfig, true);
  } else if (tree.exists('docker/traefik/dynamic/local-services.yml')) {
    tree.delete('docker/traefik/dynamic/local-services.yml');
  }
  CoerceFile(tree, 'docker/traefik/traefik.yml', traefikConfig, true);

  coerceCaCert(rootDomain, tree);
  createDefaultCerts(rootDomain, tree);
  signDefaultCerts(rootDomain, frontendApplications, tree);
  verifyCert(tree);
  printSingedCert(tree);

  printEtcHostsConfig(rootDomain, frontendApplications);

}

export default dockerComposeGenerator;
