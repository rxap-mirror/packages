import { Tree } from '@nx/devkit';

export function coerceSharedServiceConfiguration(tree: Tree) {

  if (!tree.exists('shared/service/configuration/latest/config.api.json')) {
    tree.write('shared/service/configuration/latest/config.api.json', JSON.stringify(
      {
        "service-status": {
          "baseUrl": "/api/status"
        },
        "service-configuration": {
          "baseUrl": "/api/configuration"
        },
        "service-changelog": {
          "baseUrl": "/api/changelog"
        },
        "service-user": {
          "baseUrl": "/api/user",
          "statusCheck": true
        }
      },
      null,
      2,
    ));
  }

}
