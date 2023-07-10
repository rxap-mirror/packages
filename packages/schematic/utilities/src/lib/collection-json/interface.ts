export interface CollectionJson {
  extends?: string | Array<string>;
  /** A map of schematic names to schematic details */
  schematics: Record<string, {
    aliases?: Array<string>;
    /** A folder or file path to the schematic factory */
    factory: string;
    /** A description for the schematic */
    description: string;
    /** An schematic override. It can be a local schematic or from another collection (in the format 'collection:schematic') */
    extends?: string;
    /** Location of the schema.json file of the schematic */
    schema?: string;
    /** Whether or not this schematic should be listed by the tooling. This does not prevent the tooling to run this schematic, just removes its name from listSchematicNames(). */
    hidden?: boolean;
    /** Whether or not this schematic can be called from an external schematic, or a tool. This implies hidden: true. */
    private?: boolean;
  }>;
  version?: string;
}
