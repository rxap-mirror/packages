export interface InitFeatureGeneratorSchema {
  /** The name of the feature */
  name: string;
  /** The name of the project where the feature should be added */
  project: string;
  /** If the feature should be overwritten if it already exists */
  overwrite?: boolean;
  skipFormat?: boolean;
  apiStatusCheck?: boolean;
  navigation?: {
      /** The label of the navigation item */
      label: string;
      /** The icon of the navigation item */
      icon?: {
          /** The color of the icon */
          color?: string;
        } & {
          /** The name of the icon */
          icon: string;
        } | {
          /** The name of the icon */
          svgIcon: string;
        };
    };
}
