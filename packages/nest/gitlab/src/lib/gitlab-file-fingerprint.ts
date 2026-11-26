/**
 * What GitLab reports in the headers of `HEAD /projects/:id/repository/files/:path?ref=`.
 * Describes a file without transferring its (base64 encoded) content.
 */
export interface GitlabFileFingerprint {
  /** `X-Gitlab-Content-Sha256`: SHA-256 of the file content. Use it to detect changes. */
  contentSha256: string;
  /** `X-Gitlab-Blob-Id` */
  blobId: string;
  /** `X-Gitlab-Commit-Id`: the commit the `ref` resolves to */
  commitId: string;
  /** `X-Gitlab-Last-Commit-Id`: the last commit that touched the file */
  lastCommitId?: string;
  fileName?: string;
  filePath?: string;
  ref?: string;
  /** File size in bytes */
  size?: number;
  encoding?: string;
  executeFilemode?: boolean;
}
