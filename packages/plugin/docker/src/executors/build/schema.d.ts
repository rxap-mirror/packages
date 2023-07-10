export interface BuildExecutorSchema {
  context?: string;
  dockerfile?: string;
  tag?: string[];
  buildTarget?: string;
  command: string;
  latest: boolean;
  imageSuffix?: string;
  imageName?: string;
  imageRegistry?: string;
  push?: boolean;
}
