import {
  formatFiles,
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  deepMerge,
  IsRecord,
} from '@rxap/utilities';
import {
  buildImageName,
  CoerceFile,
  CoerceIgnorePattern,
  GetRootDockerOptions,
  getServiceApiPrefix,
  getServicePort,
  IsApplicationProject,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { execSync } from 'child_process';
import 'colors';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as process from 'process';
import {
  parse,
  stringify,
} from 'yaml';
import { DockerComposeGeneratorSchema } from './schema';

function createServiceDockerCompose(
  services: Array<Application>,
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
        image: buildImageName(docker, rootDocker, true),
        environment: [
          ...options.serviceEnvironments ?? [],
          'STATUS_SERVICE_BASE_URL=http://rxap-service-status:3000',
          'ROOT_DOMAIN',
          'SENTRY_ENABLED=false',
          'ROOT_DOMAIN_PORT',
          'ENVIRONMENT_NAME=development',
        ],
        env_file: [ '.env' ],
        depends_on: [
          'rxap-service-status',
        ],
      };
      return services;
    }, {} as Record<string, any>),
  });
}

function createFrontendDockerCompose(
  services: Array<Application>,
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
        tags,
      },
    ) => {
      const host = buildSubDomainForService(name, docker);
      const labels: string[] = [];
      if (tags?.includes('module-federation')) {
        if (tags.includes('mfe:host')) {
          labels.push(`traefik.http.routers.${ name }.rule=HostRegexp(\`^.+$\`)`);
        } else {
          labels.push(`traefik.http.routers.${ name }.rule=PathPrefix(\`/__mfe/latest/${ name }\`)`);
          labels.push(`traefik.http.routers.${name}.middlewares=strip-mfe-prefix@file`);
        }
      } else {
        labels.push(`traefik.http.routers.${ name }.rule=HostRegexp(\`^${host}.+$\`)`);
      }
      if (options.middlewares?.length) {
        labels.push(`traefik.http.routers.${ name }.middlewares=${options.middlewares.join(',')}`);
      }
      services[name] = {
        image: buildImageName(docker, rootDocker, true),
        labels,
        env_file: [ '.env' ],
      };
      return services;
    }, {} as Record<string, any>),
  });
}

function createDevServiceTraefikConfig(
  services: Array<Application>,
  host: Tree,
  options: DockerComposeGeneratorSchema,
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
        if (options.middlewares?.length) {
          routers[name]['middlewares'] = options.middlewares;
        }
        return routers;
      }, {} as Record<string, any>),
      services: services.reduce((services, { name }) => {
        const port = getServicePort(host, name);
        services[name] = {
          failover: {
            service: name + '-local',
            fallback: name + '@docker',
          },
        };
        services[name + '-local'] = {
          loadBalancer: {
            healthCheck: {
              path: '/health',
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
    .filter(([ , project ]) => IsApplicationProject(project))
              .filter(([ , project ]) => project.targets?.docker)
              .filter(([ , project ]) => !project.tags?.includes('standalone'))
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
      },
      https: {
        address: ':443',
        http: {
          tls: {
            domains: [
              {
                main: rootDomain,
                sans: [
                  `auth.${ rootDomain }`,
                  `traefik.${ rootDomain }`,
                  `minio.${ rootDomain }`,
                  ...services.map(({ name }) => name + '.' + rootDomain),
                ],
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

function buildSubDomainForService(name: string, docker: Record<string, string>) {
  let subdomain = name;
  if (docker.buildArgList && Array.isArray(docker.buildArgList)) {
    const buildArg = docker.buildArgList.find((arg) => arg.startsWith('SUB_DOMAIN='));
    subdomain = buildArg ? buildArg.split('=')[1] : subdomain;
    subdomain = subdomain
      .replace('$DOT', '')
      .replace(`\${DOT}`, '')
      .replace(/\$\{DOT:-.+}/, '');
  }
  return subdomain.replace(/\.$/, '');
}

function buildDomainForService(rootDomain: string, name: string, docker: Record<string, string>) {
  return buildSubDomainForService(name, docker) + '.' + rootDomain;
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
    ...services.map(({
      name,
      docker,
    }) => buildDomainForService(rootDomain, name, docker)),
  ].join(' ');
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
    config += services.map(({
      name,
      docker,
    }) => 'DNS:' + buildDomainForService(rootDomain, name, docker)).join(',');
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

function mergeTraefikConfig(tree: Tree, newTraefikConfig: string): string {
  const existingTraefikConfig = tree.read('docker/traefik/traefik.yml')!.toString('utf-8');
  const eJson = parse(existingTraefikConfig);
  const nJson = parse(newTraefikConfig);
  const merged = deepMerge(eJson, nJson);
  return stringify(merged);
}

function coerceCertDirectory(tree: Tree) {
  const command = 'mkdir -p docker/traefik/tls';
  console.log('RUN:', command);
  return execSync(command, {
    cwd: tree.root,
  }).toString();
}

export async function dockerComposeGenerator(
  tree: Tree,
  options: DockerComposeGeneratorSchema,
) {
  options.middlewares ??= [];

  const applications = getApplications(tree, options);
  const serviceApplications = getServiceApplications(applications, options);
  const frontendApplications = getFrontendApplications(applications, options);
  const rootDomain = options.rootDomain ?? process.env.ROOT_DOMAIN ?? '127-0-0-1.nip.io';

  const rootDocker = GetRootDockerOptions(tree);
  const serviceDockerCompose = createServiceDockerCompose(serviceApplications, rootDocker, options);
  const frontendDockerCompose = createFrontendDockerCompose(frontendApplications, rootDocker, options);
  const localServiceTraefikConfig = createDevServiceTraefikConfig(serviceApplications, tree, options);
  let traefikConfig = createTraefikConfig(rootDomain, frontendApplications, tree);
  const traefikConfigPath = 'docker/traefik/traefik.yml';
  if (tree.exists(traefikConfigPath)) {
    traefikConfig = mergeTraefikConfig(tree, traefikConfig);
  }
  CoerceFile(tree, 'docker-compose.services.yml', serviceDockerCompose, true);
  CoerceFile(tree, 'docker-compose.frontends.yml', frontendDockerCompose, true);
  if (serviceApplications.length) {
    CoerceFile(tree, 'docker/traefik/dynamic/local-services.yml', localServiceTraefikConfig, true);
  } else if (tree.exists('docker/traefik/dynamic/local-services.yml')) {
    tree.delete('docker/traefik/dynamic/local-services.yml');
  }
  CoerceFile(tree, traefikConfigPath, traefikConfig, true);

  CoerceIgnorePattern(tree, 'docker/traefik/.gitignore', [
    'traefik.yml',
    'dynamic/local-services.yml',
  ]);
  CoerceIgnorePattern(tree, 'docker/traefik/tls/.gitignore', [
    '*.crt',
    '*.key',
    '*.srl',
    '*.csr',
    'ext.cnf',
    'ext.cnf.template',
  ]);
  coerceCertDirectory(tree);
  coerceCaCert(rootDomain, tree);
  createDefaultCerts(rootDomain, tree);
  signDefaultCerts(rootDomain, frontendApplications, tree);
  verifyCert(tree);
  printSingedCert(tree);

  printEtcHostsConfig(rootDomain, frontendApplications);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default dockerComposeGenerator;
