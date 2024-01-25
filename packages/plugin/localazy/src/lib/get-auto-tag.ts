import { NormalizeTag } from './normalize-tag';

export function GetAutoTag() {
  let tag: string | null = null;
  if (process.env.CI_COMMIT_TAG) {
    console.log('Get auto tag from CI_COMMIT_TAG');
    tag = process.env.CI_COMMIT_TAG;
  } else if (process.env.CI_COMMIT_BRANCH) {
    console.log('Get auto tag from CI_COMMIT_BRANCH');
    tag = process.env.CI_COMMIT_BRANCH;
  }
  console.log('Could not get auto tag from CI_COMMIT_TAG or CI_COMMIT_BRANCH');
  return NormalizeTag(tag);
}
