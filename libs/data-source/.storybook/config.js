import { addDecorator, configure } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import '../../../.storybook/config.default';

addDecorator(withKnobs);
configure(require.context('../', true, /\.stories\.(ts|mdx)$/), module);

