import { addDecorator } from "@storybook/angular";
import { withKnobs } from "@storybook/addon-knobs";
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import "!style-loader!css-loader!sass-loader!./styles.scss";

addDecorator(withKnobs);

export const parameters = {
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      ...INITIAL_VIEWPORTS
    }
  }
};
