/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nx/devkit';

export default function update(tree: Tree) {
  const sharedDockerFile = 'shared/nestjs/Dockerfile';
  if (tree.exists(sharedDockerFile)) {
    let content = tree.read(sharedDockerFile, 'utf-8')!;
    content = content.replace(
      'FROM registry.gitlab.com/rxap/docker/nestjs-server/20.11-alpine:v0.0.1-nightly.1',
      'FROM registry.gitlab.com/rxap/docker/nestjs-server/20.11-alpine:v0.1.0-edge.1'
    );
    tree.write(sharedDockerFile, content);
  }
}
