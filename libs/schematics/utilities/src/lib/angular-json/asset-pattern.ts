export type AssetPattern = {
    /** Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched. */
    followSymlinks?: boolean;
    /** The pattern to match. */
    glob: string;
    /** The input path dir in which to apply 'glob'. Defaults to the project root. */
    input: string;
    /** Absolute path within the output. */
    output: string;
    /** An array of globs to ignore. */
    ignore?: Array<string>;
  } | string | {
    /** Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched. */
    followSymlinks?: boolean;
    /** The pattern to match. */
    glob: string;
    /** The input path dir in which to apply 'glob'. Defaults to the project root. */
    input: string;
    /** Absolute path within the output. */
    output: string;
    /** An array of globs to ignore. */
    ignore?: Array<string>;
  } | string;
