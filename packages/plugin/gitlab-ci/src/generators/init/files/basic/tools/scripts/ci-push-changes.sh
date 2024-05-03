#!/bin/sh

# exit on error
set -e

commit_message=$1

if [ -z "$commit_message" ]; then
  echo "Commit message is required"
  exit 1
fi

# if there are no changes, exit
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes found"
  exit 0
fi

echo "Adding the changes to the git stage"
git add .

echo "Committing the changes"
git commit --no-verify -m "$commit_message"

echo "Pushing the changes to the branch $CI_COMMIT_BRANCH"
git push --no-verify "$CI_COMMIT_BRANCH"

echo "Done"
