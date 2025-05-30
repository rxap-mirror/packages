export interface VirtualFileLike {
  readonly name: string;
  readonly fullName?: string;
  mimetype?: string;
  get data(): ArrayBuffer | Promise<ArrayBuffer>;

  getContent(mimetype: 'text/plain', textDecoder?: typeof TextDecoder): Promise<string> | string;
  getContent(mimetype: 'application/json', textDecoder?: typeof TextDecoder): Promise<string> | string;
  getContent(mimetype: 'application/rdf+xml', textDecoder?: typeof TextDecoder): Promise<string> | string;
  getContent(mimetype?: string, textDecoder?: typeof TextDecoder): Promise<string | Blob> | string | Blob;
  getContent(): Promise<string | Blob> | string | Blob;

  setMimeType?(mimetype: string): void;

  clone?(name: string, fullName?: string, deep?: boolean): VirtualFileLike | Promise<VirtualFileLike>;
  toFile?(useFullName?: boolean): File | Promise<File>;
}

export interface SyncVirtualFileLike extends VirtualFileLike {
  toFile(useFullName?: boolean): File;
  get data(): ArrayBuffer;

  getContent(mimetype: 'text/plain', textDecoder?: typeof TextDecoder): string;
  getContent(mimetype: 'application/json', textDecoder?: typeof TextDecoder): string;
  getContent(mimetype: 'application/rdf+xml', textDecoder?: typeof TextDecoder): string;
  getContent(mimetype?: string, textDecoder?: typeof TextDecoder): string | Blob;
  getContent(): string | Blob;

  clone?(name: string, fullName?: string, deep?: boolean): VirtualFileLike;
}

export interface AsyncVirtualFileLike extends VirtualFileLike {
  toFile(useFullName?: boolean): Promise<File>;
  get data(): Promise<ArrayBuffer>;

  getContent(mimetype: 'text/plain', textDecoder?: typeof TextDecoder): Promise<string>;
  getContent(mimetype: 'application/json', textDecoder?: typeof TextDecoder): Promise<string>;
  getContent(mimetype: 'application/rdf+xml', textDecoder?: typeof TextDecoder): Promise<string>;
  getContent(mimetype?: string, textDecoder?: typeof TextDecoder): Promise<string | Blob>;
  getContent(): Promise<string | Blob>;

  clone?(name: string, fullName?: string, deep?: boolean): Promise<VirtualFileLike>;
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
    protected readonly _textDecoder?: typeof TextDecoder,
    protected readonly _textEncoder?: typeof TextEncoder,
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

  getContent(mimetype: 'text/plain', textDecoder: typeof TextDecoder): string;
  getContent(mimetype: 'application/json', textDecoder: typeof TextDecoder): string;
  getContent(mimetype: 'application/rdf+xml', textDecoder: typeof TextDecoder): string;
  getContent(mimetype: string | undefined, textDecoder: typeof TextDecoder): string | Blob;
  getContent(mimetype: 'text/plain'): Promise<string> | string;
  getContent(mimetype: 'application/json'): Promise<string> | string;
  getContent(mimetype: 'application/rdf+xml'): Promise<string> | string;
  getContent(mimetype: string | undefined): Promise<string | Blob> | string | Blob;
  getContent(): Promise<string | Blob> | string | Blob;
  getContent(mimetype?: string): Promise<string | Blob> | string | Blob;
  getContent(mimetype = this.mimetype ?? 'auto', textDecoder: typeof TextDecoder | undefined = this._textDecoder): Promise<string | Blob> | string | Blob {
    let blob: Blob;
    if (this._blob?.type === mimetype) {
      blob = this._blob;
    } else {
      this._blob = blob = new Blob([ this.data ], { type: mimetype });
    }
    if (mimetype.startsWith('text/') || mimetype.endsWith('xml') || mimetype.endsWith('json')) {
      if (!this._textContent) {
        const blob = new Blob([ this.data ], { type: mimetype });
        if (textDecoder) {
          this._textContent = this.textDecode(textDecoder);
        } else {
          return blob.text().then(text => {
            this._textContent = text;
            return text;
          });
        }
      }
      return this._textContent;
    }
    return blob;
  }

  textDecode(textDecoder: typeof TextDecoder): string {
    return new textDecoder().decode(this.data);
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

  write(textContent: string, textEncoder: typeof TextEncoder): void;
  write(textContent: string): void;
  write(data: ArrayBuffer): void;
  write(textContentOrData: string | ArrayBuffer, textEncoder: typeof TextEncoder | undefined = this._textEncoder) {
    if (typeof textContentOrData === 'string') {
      this.writeTextContent(textContentOrData, textEncoder);
    } else {
      this.writeData(textContentOrData);
    }
  }

  writeTextContent(textContent: string, textEncoder: typeof TextEncoder | undefined = this._textEncoder) {
    if (this.mimetype !== undefined) {
      if (!(this.mimetype.startsWith('text/') || this.mimetype.endsWith('xml') || this.mimetype.endsWith('json'))) {
        throw new Error(`The mimetype '${ this.mimetype }' does not support text content`);
      }
    }
    if (!textEncoder) {
      throw new Error(`If write the text content, the text encoder must be provided.`);
    }
    this._data = new textEncoder().encode(textContent);
  }

  writeData(data: ArrayBuffer) {
    this._data = data;
  }

}

export class SyncVirtualFile extends VirtualFile implements SyncVirtualFileLike {

  constructor(
    name: string,
    fullName: string,
    data: ArrayBuffer,
    mimetype?: string,
    protected override readonly _textDecoder: typeof TextDecoder = TextDecoder,
    protected override readonly _textEncoder: typeof TextEncoder = TextEncoder,
  ) {
    super(name, fullName, data, mimetype);
  }

  override getContent(mimetype: 'text/plain', textDecoder?: typeof TextDecoder): string;
  override getContent(mimetype: 'application/json', textDecoder?: typeof TextDecoder): string;
  override getContent(mimetype: 'application/rdf+xml', textDecoder?: typeof TextDecoder): string;
  override getContent(mimetype: string | undefined, textDecoder?: typeof TextDecoder): string | Blob;
  override getContent(): string | Blob;
  override getContent(mimetype?: string): string | Blob;
  override getContent(mimetype = this.mimetype ?? 'auto', textDecoder: typeof TextDecoder = this._textDecoder): string | Blob {
    return super.getContent(mimetype, textDecoder);
  }

  override write(textContent: string, textEncoder?: typeof TextEncoder): void;
  override write(textContent: string): void;
  override write(data: ArrayBuffer): void;
  override write(textContentOrData: string | ArrayBuffer, textEncoder: typeof TextEncoder = this._textEncoder) {
    if (typeof textContentOrData === 'string') {
      this.writeTextContent(textContentOrData, textEncoder);
    } else {
      this.writeData(textContentOrData);
    }
  }

  override writeTextContent(textContent: string): void;
  override writeTextContent(textContent: string, textEncoder: typeof TextEncoder): void;
  override writeTextContent(textContent: string, textEncoder: typeof TextEncoder = this._textEncoder) {
    if (this.mimetype !== undefined) {
      if (!(this.mimetype.startsWith('text/') || this.mimetype.endsWith('xml') || this.mimetype.endsWith('json'))) {
        throw new Error(`The mimetype '${ this.mimetype }' does not support text content`);
      }
    }
    this._data = new textEncoder().encode(textContent);
  }

}
