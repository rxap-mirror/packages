export interface Options {
  camelized: string;
  classified: string;
  dasherized: string;
  dtoName: string;
  collection: string;
  parentCollectionList: string[];
  privateName?: string | null;
  documentId: string;
  overwrite: boolean;
}
