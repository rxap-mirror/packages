export function GetAutoTag() {
  if (process.env.CI_COMMIT_TAG) {
    return process.env.CI_COMMIT_TAG;
  } else if (process.env.CI_COMMIT_BRANCH) {
    return process.env.CI_COMMIT_BRANCH;
  }
  return null;
}
