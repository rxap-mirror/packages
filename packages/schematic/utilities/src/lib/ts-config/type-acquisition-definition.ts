export type TypeAcquisitionDefinition = {
  /** Auto type (.d.ts) acquisition options for this project. Requires TypeScript version 2.1 or later. */
  typeAcquisition?: {
    /** Enable auto type acquisition */
    enable?: boolean;
    /** Specifies a list of type declarations to be included in auto type acquisition. Ex. ["jquery", "lodash"] */
    include?: Array<string>;
    /** Specifies a list of type declarations to be excluded from auto type acquisition. Ex. ["jquery", "lodash"] */
    exclude?: Array<string>;
  };
};
