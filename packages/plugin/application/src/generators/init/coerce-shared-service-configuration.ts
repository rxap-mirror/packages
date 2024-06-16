import { Tree } from '@nx/devkit';
import { CoerceFile } from '@rxap/workspace-utilities';

export function coerceSharedServiceConfiguration(tree: Tree) {

  CoerceFile(tree, 'shared/service/configuration/latest/config.api.json', JSON.stringify(
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
