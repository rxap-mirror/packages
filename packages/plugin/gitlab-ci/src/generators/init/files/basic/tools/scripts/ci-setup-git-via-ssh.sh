#!/bin/sh

# exit on error
set -e

if [ -z "$GIT_SSH_KEY" ]; then
  echo "No GIT_SSH_KEY variable found"
  exit 1
fi

GIT_COMMITTER_EMAIL=${GIT_COMMITTER_EMAIL:-$GITLAB_USER_EMAIL}
GIT_COMMITTER_NAME=${GIT_COMMITTER_NAME:-$GITLAB_USER_NAME}

if [ -z "$GIT_COMMITTER_EMAIL" ]; then
  echo "No GIT_COMMITTER_EMAIL variable found"
  exit 1
fi

if [ -z "$GIT_COMMITTER_NAME" ]; then
  echo "No GIT_COMMITTER_NAME variable found"
  exit 1
fi

echo "GIT_COMMITTER_EMAIL: $GIT_COMMITTER_EMAIL"
echo "GIT_COMMITTER_NAME: $GIT_COMMITTER_NAME"

mkdir -p ~/.ssh

echo "
Host $CI_SERVER_SHELL_SSH_HOST
  HostName $CI_SERVER_SHELL_SSH_HOST
  User git
  Port $CI_SERVER_SHELL_SSH_PORT
  IdentityFile $GIT_SSH_KEY
  IdentitiesOnly yes
" > ~/.ssh/config

chmod 600 ~/.ssh/config
chmod 600 "$GIT_SSH_KEY"

echo "SSH configuration: ~/.ssh/config"
cat ~/.ssh/config

echo "Adding the ssh key to the known hosts"
ssh-keyscan -H "$CI_SERVER_SHELL_SSH_HOST" >> ~/.ssh/known_hosts

echo "Connecting to the ssh server"
ssh git@$CI_SERVER_SHELL_SSH_HOST

echo "Current git version: $(git --version)"

echo "Setting up the git configuration"
git config --global core.sshCommand "ssh -F ~/.ssh/config"
git config --global user.email "$GIT_COMMITTER_EMAIL"
git config --global user.name "$GIT_COMMITTER_NAME"

git remote add ssh git@$CI_SERVER_SHELL_SSH_HOST:$CI_PROJECT_PATH.git

echo "Checking out the branch $CI_COMMIT_BRANCH"
git checkout "$CI_COMMIT_BRANCH"

echo "Pulling the latest changes from the branch $CI_COMMIT_BRANCH"
git pull origin "$CI_COMMIT_BRANCH"

echo "Fetch the remote branch"
git fetch --depth 1 ssh "$CI_COMMIT_BRANCH"

echo "Set the upstream to ssh"
git branch --set-upstream-to="ssh/$CI_COMMIT_BRANCH" "$CI_COMMIT_BRANCH"

echo "verifying the changes"
git branch -vv

echo "current git status"
git status

echo "current git branch"
git branch

echo "current head commit"
git rev-parse HEAD

echo "Done"
