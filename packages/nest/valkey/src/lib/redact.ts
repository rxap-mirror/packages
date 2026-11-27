/**
 * Masks credentials in a message before it is logged or put into an error:
 * the password part of `redis://` / `rediss://` URLs and any explicitly given secret.
 */
export function redactSecrets(
  message: string,
  secrets: ReadonlyArray<string | undefined> = []
): string {
  let result = message.replace(/(rediss?:\/\/[^:@/\s]*:)[^@/\s]*@/g, '$1***@');
  for (const secret of secrets) {
    if (secret) {
      result = result.split(secret).join('***');
    }
  }
  return result;
}
