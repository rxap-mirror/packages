/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nx/devkit';

export default function update(tree: Tree) {
  const sharedDockerFile = 'shared/nestjs/Dockerfile';
  const version = 'v0.0.1-nightly.1';
  if (tree.exists(sharedDockerFile)) {
    let content = tree.read(sharedDockerFile, 'utf-8')!;
    content = content.replace(/(registry.gitlab.com\/rxap\/docker\/nestjs-server):(.+)/, (substring, image, type) => {
      return `${image}/${type}:${version}`;
    });
    tree.write(sharedDockerFile, content);
  }
}
