export interface PresetGeneratorSchema {
  packages: boolean;
  standalone?: boolean;
  repositoryUrl?: string;
  license?: 'mit' | 'gpl' | 'none';
  skipInstall?: boolean;
}
