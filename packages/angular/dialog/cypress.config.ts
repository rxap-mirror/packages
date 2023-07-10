import { componentTestingPreset } from 'workspace';
import { defineConfig } from 'cypress';

export default defineConfig({
  component: componentTestingPreset(__filename),
});