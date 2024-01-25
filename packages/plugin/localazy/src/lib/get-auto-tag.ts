export function GetAutoTag() {
  if (process.env.CI_COMMIT_TAG) {
    console.log('Get auto tag from CI_COMMIT_TAG');
    return process.env.CI_COMMIT_TAG;
  } else if (process.env.CI_COMMIT_BRANCH) {
    console.log('Get auto tag from CI_COMMIT_BRANCH');
    return process.env.CI_COMMIT_BRANCH;
  }
  console.log('Could not get auto tag from CI_COMMIT_TAG or CI_COMMIT_BRANCH');
  return null;
}
