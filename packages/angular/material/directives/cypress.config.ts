import { defineConfig } from 'cypress';
import { componentTestingPreset } from 'workspace';

export default defineConfig({
  component: componentTestingPreset(__filename),
});
