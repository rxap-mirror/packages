import { Tree } from '@nx/devkit';

const devContainer = {
  "name": "RxAP Workspace",
  // Or use a Dockerfile or Docker Compose file. More info: https://containers.dev/guide/dockerfile
  //	"image": "mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye",
  "build": {
    // Path is relative to the devcontainer.json file.
    "dockerfile": "Dockerfile"
  },
  // Features to add to the dev container. More info: https://containers.dev/features.
  "features": {
    // The host and the container must be running on the same chip architecture. You will not be able to use it with an emulated x86 image with Docker Desktop on an Apple Silicon Mac
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  // Use 'forwardPorts' to make a list of ports inside the container available locally.
  "forwardPorts": [
    4200,
    8888
  ],
  // Use 'postCreateCommand' to run commands after the container is created.
  "postCreateCommand": "yarn && yarn init:env",
  // Configure tool-specific properties.
  "customizations": {
    "vscode": {
      "extensions": [
        "Angular.ng-template",
        "vivaxy.vscode-conventional-commits",
        "nrwl.angular-console",
        "redhat.vscode-yaml",
        "esbenp.prettier-vscode",
        "firsttris.vscode-jest-runner",
        "dbaeumer.vscode-eslint"
      ]
    },
    "jetbrains": {
      "backend": "WebStorm"
    }
  },
  // Uncomment to connect as root instead. More info: https://aka.ms/dev-containers-non-root.
  "remoteUser": "root"
};

export function coerceDevContainerConfig(tree: Tree) {

  if (tree.exists('.devcontainer/devcontainer.json')) {
    return;
  }

  tree.write('.devcontainer/devcontainer.json', JSON.stringify(devContainer, null, 2));

}
