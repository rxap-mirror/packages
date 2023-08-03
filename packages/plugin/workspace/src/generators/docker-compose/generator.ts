import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  GetProjectSourceRoot,
} from '@rxap/generator-utilities';
import { IsRecord } from '@rxap/utilities';
import { join } from 'path';
import { stringify } from 'yaml';
import { DockerComposeGeneratorSchema } from './schema';

function getServiceApiPrefix(name: string, host: Tree) {
  const projectSourceRoot = GetProjectSourceRoot(host, name);
  const DockerFilePath = join(projectSourceRoot, 'Dockerfile');
  const dockerFile = host.read(DockerFilePath)?.toString('utf-8');
  const match = dockerFile.match(/ENV GLOBAL_API_PREFIX[\s=]"([^"]+)"/);
  const globalApiPrefix = match[1];
  return '/' + globalApiPrefix;
}

function buildImageName(docker: Record<string, string>): string {
  const imageRegistry = `\${REGISTRY:-${ docker.imageRegistry }}`;
  if (!docker.imageName) {
    throw new Error('The docker image name is required!');
  }
  const imageName = `${ docker.imageName }${ docker.imageSuffix ?? '' }`;
  const imageTag = `\${CHANNEL:-development}`;

  return `${ imageRegistry }/${ imageName }:${ imageTag }`;
}

function createServiceDockerCompose(
  services: Array<{ name: string; docker: Record<string, string> }>,
  host: Tree,
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
        image: buildImageName(docker),
        labels: [
          'traefik.enable=true',
          `traefik.http.services.${ name }.loadbalancer.server.port=3333`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.path=${ getServiceApiPrefix(
            name,
            host,
          ) }/health`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.interval=10s`,
          `traefik.http.services.${ name }.loadbalancer.healthCheck.timeout=3s`,
        ],
        environment: [
          `LEGACY_BASE_URL=https://\${REMOTE_DOMAIN}/backend`,
          `SERVICE_SERVER_BASE_URL=https://\${REMOTE_DOMAIN}/vpn`,
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
    }, {}),
  });
}

function createFrontendDockerCompose(
  services: Array<{ name: string; docker: Record<string, string> }>,
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
        image: buildImageName(docker),
        labels: [
          'traefik.enable=true',
          `traefik.http.routers.${ name }.entrypoints=https`,
          `traefik.http.routers.${ name }.rule=Host(\`${ name }.\${ROOT_DOMAIN}\`)`,
          `traefik.http.services.${ name }.loadbalancer.server.port=80`,
          `traefik.http.routers.${ name }.priority=10`,
        ],
        depends_on: [
          'traefik',
          'rxap-configuration-service',
          'rxap-status-service',
          'catch-all-api',
        ],
      };
      return services;
    }, {}),
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
      }, {}),
      services: services.reduce((services, { name }) => {
        const sourceRoot = GetProjectSourceRoot(host, name);
        const appModuleFilePath = join(sourceRoot, 'app', 'app.module.ts');
        const appModule = host.read(appModuleFilePath)?.toString('utf-8');
        const port = appModule.match(
          /PORT: Joi\.number\(\).default\((\d+)\)/,
        )[1];
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
      }, {}),
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

export async function dockerComposeGenerator(
  tree: Tree,
  options: DockerComposeGeneratorSchema,
) {

  const applications = getApplications(tree, options);
  const serviceApplications = getServiceApplications(applications, options);
  const frontendApplications = getFrontendApplications(applications, options);

  const serviceDockerCompose = createServiceDockerCompose(serviceApplications, tree);
  const frontendDockerCompose = createFrontendDockerCompose(frontendApplications);
  const traefikConfig = createDevServiceTraefikConfig(serviceApplications, tree);

  CoerceFile(tree, 'docker-compose.services.yml', serviceDockerCompose, true);
  CoerceFile(tree, 'docker-compose.frontends.yml', frontendDockerCompose, true);
  CoerceFile(tree, 'docker/traefik/dynamic/local-services.yml', traefikConfig, true);

}

export default dockerComposeGenerator;
