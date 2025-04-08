export interface VirtualFileLike {
  readonly name: string;
  readonly fullName?: string;
  mimetype?: string;
  get data(): ArrayBuffer | Promise<ArrayBuffer>;

  getContent(mimetype: 'text/plain'): Promise<string>;
  getContent(mimetype: 'application/json'): Promise<string>;
  getContent(mimetype: 'application/rdf+xml'): Promise<string>;
  getContent(mimetype?: string): Promise<string | Blob>;

  setMimeType?(mimetype: string): void;
}

export class VirtualFile implements VirtualFileLike {

  static EMPTY(name: string, fullName: string, mimetype?: string,) {
    return new VirtualFile(name, fullName, new ArrayBuffer(0), mimetype);
  }

  private _textContent: string | null = null;
  private _blob: Blob | null = null;

  constructor(
    public readonly name: string,
    /**
     * The name with the path from the root as prefix
     */
    public readonly fullName: string,
    protected _data: ArrayBuffer,
    public mimetype?: string,
  ) {
    if (this.name.includes('/')) {
      throw new Error(`The file name '${ name }' must not contain a path`);
    }
    if (!this.fullName.endsWith(this.name)) {
      throw new Error(`The full name '${ fullName }' must end with the file name '${ name }'`);
    }
  }

  get data(): ArrayBuffer {
    return this._data;
  }

  async getContent(mimetype: 'text/plain'): Promise<string>;
  async getContent(mimetype: 'application/json'): Promise<string>;
  async getContent(mimetype: 'application/rdf+xml'): Promise<string>;
  async getContent(mimetype?: string): Promise<string | Blob>;
  async getContent(mimetype = this.mimetype ?? 'auto'): Promise<string | Blob> {
    let blob: Blob;
    if (this._blob?.type === mimetype) {
      blob = this._blob;
    } else {
      this._blob = blob = new Blob([ this.data ], { type: mimetype });
    }
    if (mimetype.startsWith('text/') || mimetype.endsWith('xml') || mimetype.endsWith('json')) {
      if (!this._textContent) {
        const blob = new Blob([ this.data ], { type: mimetype });
        this._textContent = await blob.text();
      }
      return this._textContent;
    }
    return blob;
  }

  setMimeType(mimetype: string) {
    this.mimetype = mimetype;
  }

  toFile(useFullName = false): File {
    return new File([ this.data ], useFullName ? this.fullName : this.name, { type: this.mimetype });
  }

  toBuffer(): Buffer {
    return Buffer.from(this.data);
  }

  toJSON() {
    return {
      mimetype: this.mimetype,
      byteLength: this.data.byteLength,
    };
  }

  /**
   * Clones the file.
   * @param name the new name of the file defaults to the current name
   * @param fullName the new full name of the file defaults to the current name. Will replace the name if it is changed.
   * @param deep true - the data is copied, false - the data is shared
   */
  clone(name = this.name, fullName = this.fullName, deep = false) {
    if (name !== this.name && !fullName.endsWith(name)) {
      fullName.replace(new RegExp(`${this.name}$`), name);
    }
    return new VirtualFile(name, fullName, deep ? this.data.slice(0) : this.data);
  }

  write(textContent: string, textEncoder: typeof TextEncoder) {
    if (this.mimetype !== undefined) {
      if (!(this.mimetype.startsWith('text/') || this.mimetype.endsWith('xml') || this.mimetype.endsWith('json'))) {
        throw new Error(`The mimetype '${ this.mimetype }' does not support text content`);
      }
    }
    this._data = new textEncoder().encode(textContent);
    this._textContent = textContent;
    this._blob = new Blob([ this.data ], { type: this.mimetype });
  }

}
