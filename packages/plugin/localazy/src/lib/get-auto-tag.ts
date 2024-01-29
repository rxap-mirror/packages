export function GetAutoTag(): string | null {
  if (process.env.CI_COMMIT_REF_SLUG) {
    console.log('Get auto tag from CI_COMMIT_REF_SLUG');
    return process.env.CI_COMMIT_REF_SLUG;
  }
  console.log('Could not get auto tag from CI_COMMIT_REF_SLUG');
  return null;
}
