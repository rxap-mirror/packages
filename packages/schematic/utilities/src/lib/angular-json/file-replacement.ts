export type FileReplacement = {
  src: string;
  replaceWith: string;
} | {
  replace: string;
  with: string;
};
