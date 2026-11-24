export interface PresetGeneratorSchema {
  /** If true, the workspace will be initialized for package development */
  packages?: boolean;
  /** If true, the workspace will be initialized for standalone development */
  standalone?: boolean;
  license?: 'none' | 'mit' | 'gpl';
  /** The URL of the repository */
  repositoryUrl?: string;
  skipInstall?: boolean;
  /** The package manager of the workspace. Detected from the root package.json packageManager field or the lockfile when omitted */
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
}
