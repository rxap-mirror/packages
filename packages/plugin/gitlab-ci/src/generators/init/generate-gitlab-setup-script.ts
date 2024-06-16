import { Tree } from '@nx/devkit';
import {
  CoerceFile,
  GetWorkspaceName,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomMinute() {
  return randomNumber(0, 59);
}

function randomHour() {
  return randomNumber(0, 6);
}

function generateReleaseItSetup(workspaceName: string) {

  let bashScript = '\n### Release It Setup ###\n\n';

  bashScript += 'echo "Generate Deploy SSH Key..."\n';
  bashScript += `ssh-keygen -t rsa -b 4096 -C "release-it@${ workspaceName }" -f ./id_rsa_deploy -N ""\n\n`;
  bashScript += 'echo "Add Deploy Key to Gitlab..."\n';
  bashScript += 'glab api /projects/:id/deploy_keys -F title="Release It" -F key="@./id_rsa_deploy.pub" -F can_push=true --silent\n\n';
  bashScript += 'echo "Add GIT_SSH_KEY to Gitlab CI/CD Variables..."\n';
  bashScript += 'cat ./id_rsa_deploy | glab variable set "GIT_SSH_KEY" --type file --protected\n\n';
  bashScript += 'echo "Delete Deploy SSH Key..."\n';
  bashScript += 'rm ./id_rsa_deploy\n';
  bashScript += 'rm ./id_rsa_deploy.pub\n\n';
  bashScript += 'echo "Create nightly ci/cd schedule..."\n';
  bashScript += `glab schedule create --cron "${randomMinute()} ${randomHour()} * * *" --description "Nightly Release" --ref "development" --variable "RELEASE_IT:true" --variable "RELEASE_IT_CHANNEL:nightly"\n\n`;
  bashScript += 'echo "Done!"\n\n';

  return bashScript;
}


export function generateGitlabCiSetupScript(tree: Tree, options: InitGeneratorSchema) {

  let bashScript = '#!/bin/bash\n\n';

  const workspaceName = GetWorkspaceName(tree);

  if (options.release === 'release-it') {
    bashScript += generateReleaseItSetup(workspaceName);
  }

  CoerceFile(tree, 'gitlab-ci-setup.sh', bashScript, true);

}
