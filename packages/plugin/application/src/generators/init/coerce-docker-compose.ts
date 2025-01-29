import { Tree } from '@nx/devkit';
import {
  deepMerge,
  equals,
} from '@rxap/utilities';
import { CoerceFile } from '@rxap/workspace-utilities';
import {
  parse,
  stringify,
} from 'yaml';

interface DockerComposeService {
  image: string;
  ports?: string[];
  environment?: string[];
  labels?: string[];
  volumes?: string[];
  env_file?: string[];
  depends_on?: string[];
}

interface DockerCompose {
  version: string;
  networks?: {
    default?: {
      name: string;
    }
  };
  services?: Record<string, DockerComposeService>;
}

export function coerceDockerComposeService(dockerCompose: DockerCompose, name: string, service: DockerComposeService) {
  dockerCompose.services ??= {};
  dockerCompose.services[name] ??= { image: service.image };
  dockerCompose.services[name] = deepMerge(dockerCompose.services[name], service);
}

export function coerceDockerCompose(tree: Tree) {

  let dockerCompose: DockerCompose = { version: '3.7' };
  let originalDockerCompose: DockerCompose | undefined;
  if (tree.exists('docker-compose.yml')) {
    originalDockerCompose = dockerCompose = parse(tree.read('docker-compose.yml', 'utf-8')!);
  }

  dockerCompose.networks ??= {};
  dockerCompose.networks.default ??= { name: 'traefik' };

  coerceDockerComposeService(dockerCompose, 'traefik', {
    image: 'traefik:latest',
    volumes: [
      '/etc/localtime:/etc/localtime:ro',
      '${XDG_RUNTIME_DIR:-/var/run}/docker.sock:/var/run/docker.sock:ro',
      './docker/traefik:/etc/traefik:ro',
    ],
    ports: [
      '${ROOT_DOMAIN_PORT:-8443}:443',
      '8888:8080',
    ],
    labels: [
      'traefik.enable=true',
      'traefik.http.routers.traefik.entrypoints=https',
      'traefik.http.routers.traefik.rule=Host(`traefik.${ROOT_DOMAIN}`)',
      'traefik.http.services.traefik.loadbalancer.server.port=8080',
    ]
  });

  coerceDockerComposeService(dockerCompose, 'catch-all-api', { image: 'registry.gitlab.com/rxap/docker/catch-all:alpine' });
  coerceDockerComposeService(dockerCompose, 'cors-options', { image: 'registry.gitlab.com/rxap/docker/cors-options:alpine' });

  const environment = [
    'ROOT_DOMAIN',
    'SENTRY_ENABLED=false',
    'LOG_LEVEL=verbose',
    'ROOT_DOMAIN_PORT',
    'ENVIRONMENT_NAME=development'
  ];

  coerceDockerComposeService(dockerCompose, 'rxap-service-configuration', {
    image: 'registry.gitlab.com/rxap/applications/services/configuration:${RXAP_SERVICE_CONFIGURATION:-development}',
    volumes: [
      './shared/service/configuration:/app/assets:ro',
    ],
    environment,
    env_file: ['.env'],
  });

  coerceDockerComposeService(dockerCompose, 'rxap-service-changelog', {
    image: 'registry.gitlab.com/rxap/applications/services/changelog:${RXAP_SERVICE_CHANGELOG:-development}',
    volumes: [
      './shared/service/changelog:/app/assets:ro',
    ],
    environment,
    env_file: ['.env'],
  });

  coerceDockerComposeService(dockerCompose, 'rxap-service-user', {
    image: 'registry.gitlab.com/rxap/applications/services/user:${RXAP_SERVICE_USER:-development}',
    volumes: [
      './shared/service/user:/app/assets:ro',
    ],
    environment,
    env_file: ['.env'],
  });

  if (!originalDockerCompose || !equals(originalDockerCompose, dockerCompose)) {
    CoerceFile(tree, 'docker-compose.yml', stringify(dockerCompose), true);
  }

}
