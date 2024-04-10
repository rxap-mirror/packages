import { Tree } from '@nx/devkit';

export function coerceSharedServiceUserConfig(tree: Tree) {

  if (!tree.exists('shared/service/user/get-user-profile.json')) {
    tree.write('shared/service/user/get-user-profile.json', JSON.stringify(
      {
        'serverId': 'auth',
        'operationId': 'getUserProfile',
        'operation': {
          'operationId': 'getUserProfile',
          'parameters': [],
          'responses': {},
          'method': 'get',
          'path': '/application/o/userinfo',
        },
      },
      null,
      2,
    ));
  }

  if (!tree.exists('shared/service/user/open-api-server-config.json')) {
    tree.write('shared/service/user/open-api-server-config.json', JSON.stringify(
      [
        {
          'id': 'auth',
          'url': 'http://server:9000',
        },
      ],
      null,
      2,
    ));
  }

}
