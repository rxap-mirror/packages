export interface InitApplicationGeneratorSchema {
  sentry?: boolean;
  openApi?: boolean;
  config?: boolean;
  projects?: string[];
  localazy?: boolean;
  i18n?: boolean;
  serviceWorker?: boolean;
  languages?: string[];
  material?: boolean;
  generateMain?: boolean;
  overwrite?: boolean;
  cleanup?: boolean;
  monolithic?: boolean;
}
