import { Tree } from '@nx/devkit';
import { CoerceFile } from '@rxap/workspace-utilities';

export function coerceSharedServiceUserConfig(tree: Tree) {

  const getUserProfile = {
    'serverId': 'auth',
    'operationId': 'getUserProfile',
    'operation': {
      'operationId': 'getUserProfile',
      'parameters': [],
      'responses': {},
      'method': 'get',
      'path': '/application/o/userinfo',
    },
  };
  const getUserProfileContent = JSON.stringify(getUserProfile, null, 2);

  CoerceFile(tree, 'shared/service/user/get-user-profile.json', getUserProfileContent);

  const getUserProfileConfig = {
    'id': 'auth',
    'url': 'http://server:9000',
  };
  const getUserProfileConfigContent = JSON.stringify(getUserProfileConfig, null, 2);

  CoerceFile(tree, 'shared/service/user/open-api-server-config.json', getUserProfileConfigContent);

}
