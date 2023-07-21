export type Builder = {
  /** Schema for builder option validation. */
  schema: string;
  /** Builder description. */
  description: string;
} & ({
  /** The next generation builder module. */
  implementation: string;
} | {
  /** The builder class module. */
  class: string;
});
