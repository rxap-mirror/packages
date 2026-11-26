/**
 * The HTTP status of an error thrown by the SDK.
 *
 * The SDK throws `GitbeakerRequestError` for non 2xx responses (`error.cause.response.status`,
 * `error.message` is the error description sent by GitLab), `GitbeakerTimeoutError` and
 * `GitbeakerRetryError` (no response available). Returns `undefined` when the error carries no response.
 */
export function getGitlabErrorStatus(error: unknown): number | undefined {
  const status = (error as { cause?: { response?: { status?: unknown } } } | undefined)?.cause?.response?.status;
  return typeof status === 'number' ? status : undefined;
}
