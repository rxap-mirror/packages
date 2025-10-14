export type TextualMime =
  | `text/${ string }`
  | `${ string }/json`
  | `${ string }+json`
  | `${ string }/xml`
  | `${ string }+xml`;

export function isTextualMime(mimetype: string): mimetype is TextualMime {
  return mimetype.startsWith('text/') || mimetype.endsWith('json') || mimetype.endsWith('xml');
}

export type BinaryMime =
  | `application/${ string }`
  | `image/${ string }`
  | `audio/${ string }`
  | `video/${ string }`
  | `font/${ string }`
  | `model/${ string }`

export function isBinaryMime(mimetype: string): mimetype is BinaryMime {
  return mimetype.startsWith('application/')
         || mimetype.startsWith('image/')
         || mimetype.startsWith('audio/')
         || mimetype.startsWith('video/')
         || mimetype.startsWith('font/')
         || mimetype.startsWith('model/');
}

export type MimeType = TextualMime | BinaryMime | string;

export function isMimeType(mimetype: string): mimetype is MimeType {
  return isTextualMime(mimetype) || isBinaryMime(mimetype) || !!mimetype.match(/^[^/]+\/[^+]+(\+[^/]+)?$/);
}

export interface VirtualFileLike {
  readonly name: string;
  readonly fullName?: string;
  mimetype?: MimeType;
  get data(): ArrayBuffer | Promise<ArrayBuffer>;

  getContent(mimetype: TextualMime, textDecoder?: typeof TextDecoder): Promise<string> | string;

  getContent(mimetype: BinaryMime, textDecoder?: typeof TextDecoder): Promise<Blob> | Blob;

  getContent(mimetype?: MimeType, textDecoder?: typeof TextDecoder): Promise<string | Blob> | string | Blob;
  getContent(): Promise<string | Blob> | string | Blob;

  setMimeType?(mimetype: MimeType): void;

  clone?(name: string, fullName?: string, deep?: boolean): VirtualFileLike | Promise<VirtualFileLike>;
  toFile?(useFullName?: boolean): File | Promise<File>;

  getBlob?(mimetype?: MimeType): Blob | Promise<Blob>;

  getText?(mimetype?: TextualMime, textDecoder?: typeof TextDecoder): string | Promise<string>;

  write?(textContentOrData: string | ArrayBuffer, textEncoder?: typeof TextEncoder): void | Promise<void>;
  writeTextContent?(textContent: string, textEncoder?: typeof TextEncoder): void | Promise<void>;
  writeData?(data: ArrayBuffer): void | Promise<void>;

  clear?(): void;
}

export interface SyncVirtualFileLike extends VirtualFileLike {
  get data(): ArrayBuffer;

  getContent(mimetype: TextualMime, textDecoder?: typeof TextDecoder): string;

  getContent(mimetype: BinaryMime, textDecoder?: typeof TextDecoder): Blob;

  getContent(mimetype?: MimeType, textDecoder?: typeof TextDecoder): string | Blob;
  getContent(): string | Blob;

  toFile?(useFullName?: boolean): File;
  clone?(name: string, fullName?: string, deep?: boolean): VirtualFileLike;

  getBlob?(mimetype?: MimeType): Blob;

  getText?(mimetype?: TextualMime, textDecoder?: typeof TextDecoder): string;
  write?(textContentOrData: string | ArrayBuffer, textEncoder?: typeof TextEncoder): void;
  writeTextContent?(textContent: string, textEncoder?: typeof TextEncoder): void;
  writeData?(data: ArrayBuffer): void;
}

export interface AsyncVirtualFileLike extends VirtualFileLike {
  get data(): Promise<ArrayBuffer>;

  getContent(mimetype: TextualMime, textDecoder?: typeof TextDecoder): Promise<string>;

  getContent(mimetype: BinaryMime, textDecoder?: typeof TextDecoder): Promise<Blob>;

  getContent(mimetype?: MimeType, textDecoder?: typeof TextDecoder): Promise<string | Blob>;
  getContent(): Promise<string | Blob>;

  toFile?(useFullName?: boolean): Promise<File>;
  clone?(name: string, fullName?: string, deep?: boolean): Promise<VirtualFileLike>;

  getBlob?(mimetype?: MimeType): Promise<Blob>;

  getText?(mimetype?: TextualMime, textDecoder?: typeof TextDecoder): Promise<string>;
  write?(textContentOrData: string | ArrayBuffer, textEncoder?: typeof TextEncoder): Promise<void>;
  writeTextContent?(textContent: string, textEncoder?: typeof TextEncoder): Promise<void>;
  writeData?(data: ArrayBuffer): Promise<void>;
}

export class VirtualFile implements VirtualFileLike {

  static EMPTY(name: string, fullName: string, mimetype?: MimeType) {
    return new VirtualFile(name, fullName, new ArrayBuffer(0), mimetype);
  }

  protected _textContent: string | null = null;
  protected _blob: Blob | null = null;

  get data(): ArrayBuffer {
    return this._data;
  }

  get byteLength(): number {
    return this._data.byteLength;
  }

  constructor(
    public readonly name: string,
    /**
     * The name with the path from the root as prefix
     */
    public readonly fullName: string,
    protected _data: ArrayBuffer,
    public mimetype?: MimeType,
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

  getContent(mimetype: TextualMime, textDecoder: typeof TextDecoder): string;
  getContent(mimetype: BinaryMime, textDecoder: typeof TextDecoder): Blob;
  getContent(mimetype: MimeType | undefined, textDecoder: typeof TextDecoder): string | Blob;
  getContent(mimetype: TextualMime): Promise<string> | string;
  getContent(mimetype: BinaryMime): Promise<Blob> | Blob;
  getContent(mimetype: MimeType | undefined): Promise<string | Blob> | string | Blob;
  getContent(): Promise<string | Blob> | string | Blob;
  getContent(mimetype?: MimeType): Promise<string | Blob> | string | Blob;
  getContent(
    mimetype: MimeType = this.mimetype ?? 'auto',
    textDecoder: typeof TextDecoder | undefined = this._textDecoder,
  ): Promise<string | Blob> | string | Blob {
    if (isTextualMime(mimetype)) {
      if (!this._textContent) {
        if (textDecoder) {
          this._textContent = this.textDecode(textDecoder);
        } else {
          const text = this.getText(mimetype);
          if (typeof text === 'object' && 'then' in text) {
            return text.then((text) => {
              this._textContent = text;
              return this._textContent;
            });
          }
          this._textContent = text;
        }
      }
      return this._textContent;
    }
    return this.getBlob();
  }

  getText(mimetype: TextualMime | undefined, textDecoder: typeof TextDecoder): string;
  getText(mimetype: TextualMime): Promise<string> | string;
  getText(): Promise<string> | string;
  getText(
    mimetype?: TextualMime,
    textDecoder: typeof TextDecoder | undefined = this._textDecoder,
  ): string | Promise<string> {
    if (!mimetype) {
      if (this.mimetype && isTextualMime(this.mimetype)) {
        mimetype = this.mimetype;
      } else {
        throw new Error(`The mimetype '${ this.mimetype }' is not a textual mimetype`);
      }
    }
    if (!this._textContent) {
      if (textDecoder) {
        this._textContent = this.textDecode(textDecoder);
      } else {
        if (typeof window === 'undefined') {
          return this.toBuffer().toString('utf8');
        } else {
          const blob = this.getBlob(mimetype);
          if (blob.text) {
            return blob.text();
          } else {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsText(blob);
            });
          }
        }
      }
    }
    return this._textContent;
  }

  getBlob(mimetype: MimeType = this.mimetype ?? 'auto') {
    if (!this._blob || this._blob.type !== mimetype) {
      if (this._blob) {
        this.setMimeType(mimetype);
      }
      this._blob = new Blob([ this.data ], { type: this.mimetype });
    }
    return this._blob;
  }

  textDecode(textDecoder: typeof TextDecoder): string {
    return new textDecoder().decode(this.data);
  }

  setMimeType(mimetype: MimeType) {
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
      byteLength: this.byteLength,
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
    this._blob = null;
    this._textContent = null;
  }

  writeTextContent(textContent: string, textEncoder: typeof TextEncoder | undefined = this._textEncoder) {
    if (this.mimetype !== undefined) {
      if (!isTextualMime(this.mimetype)) {
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

  clear() {
    this._blob = null;
    this._textContent = null;
  }

}

export class SyncVirtualFile extends VirtualFile implements SyncVirtualFileLike {

  constructor(
    name: string,
    fullName: string,
    data: ArrayBuffer,
    mimetype?: MimeType,
    protected override readonly _textDecoder: typeof TextDecoder = TextDecoder,
    protected override readonly _textEncoder: typeof TextEncoder = TextEncoder,
  ) {
    super(name, fullName, data, mimetype, _textDecoder, _textEncoder);
  }

  override getContent(mimetype: TextualMime, textDecoder?: typeof TextDecoder): string;
  override getContent(mimetype: BinaryMime, textDecoder?: typeof TextDecoder): Blob;
  override getContent(mimetype: MimeType | undefined, textDecoder?: typeof TextDecoder): string | Blob;
  override getContent(): string | Blob;
  override getContent(mimetype?: MimeType): string | Blob;
  override getContent(
    mimetype: MimeType = this.mimetype ?? 'auto', textDecoder: typeof TextDecoder = this._textDecoder): string | Blob {
    return super.getContent(mimetype, textDecoder);
  }

  override getText(): string
  override getText(mimetype: TextualMime | undefined): string
  override getText(mimetype?: TextualMime | undefined, textDecoder: typeof TextDecoder = this._textDecoder): string {
    return super.getText(mimetype, textDecoder);
  }

}

export class AsyncVirtualFile implements AsyncVirtualFileLike {

  get data(): Promise<ArrayBuffer> {
    if (this._data) {
      this._dataPromise = Promise.resolve(this._data);
    }
    if (!this._dataPromise) {
      const data = typeof this.dataFactory === 'function' ? this.dataFactory() : this.dataFactory;
      this._dataPromise = data.then((data) => {
        this._byteLength = data.byteLength;
        return data;
      });
    }
    return this._dataPromise;
  }

  get byteLength(): Promise<number> {
    if (this._byteLength) {
      return Promise.resolve(this._byteLength);
    }
    return this.data.then(data => data.byteLength);
  }

  protected _byteLength: number | null = null;
  protected _dataPromise: Promise<ArrayBuffer> | null = null;
  protected _textContent: string | null = null;
  protected _blob: Blob | null = null;
  protected _data: ArrayBuffer | null = null;

  constructor(
    public readonly name: string,
    /**
     * The name with the path from the root as prefix
     */
    public readonly fullName: string,
    protected readonly dataFactory: Promise<ArrayBuffer> | (() => Promise<ArrayBuffer>),
    public mimetype?: MimeType,
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

  getContent(mimetype: TextualMime): Promise<string>;
  getContent(mimetype: BinaryMime): Promise<Blob>;
  getContent(mimetype: MimeType | undefined): Promise<string | Blob>;
  getContent(): Promise<string | Blob>;
  getContent(mimetype?: MimeType): Promise<string | Blob>;
  async getContent(
    mimetype: MimeType = this.mimetype ?? 'auto',
    textDecoder: typeof TextDecoder | undefined = this._textDecoder,
  ): Promise<string | Blob> {
    if (isTextualMime(mimetype)) {
      if (!this._textContent) {
        if (textDecoder) {
          this._textContent = await this.textDecode(textDecoder);
        } else {
          const text = this.getText(mimetype);
          if (typeof text === 'object' && 'then' in text) {
            return text.then((text) => {
              this._textContent = text;
              return this._textContent;
            });
          }
          this._textContent = text;
        }
      }
      return this._textContent;
    }
    return this.getBlob();
  }

  async getText(
    mimetype?: TextualMime,
    textDecoder: typeof TextDecoder | undefined = this._textDecoder,
  ): Promise<string> {
    if (!mimetype) {
      if (this.mimetype && isTextualMime(this.mimetype)) {
        mimetype = this.mimetype;
      } else {
        throw new Error(`The mimetype '${ this.mimetype }' is not a textual mimetype`);
      }
    }
    if (!this._textContent) {
      if (textDecoder) {
        this._textContent = await this.textDecode(textDecoder);
      } else {
        if (typeof window === 'undefined') {
          return this.toBuffer().then(buffer => buffer.toString('utf8'));
        } else {
          const blob = await this.getBlob(mimetype);
          if (blob.text) {
            return blob.text();
          } else {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsText(blob);
            });
          }
        }
      }
    }
    return this._textContent;
  }

  async getBlob(mimetype: MimeType = this.mimetype ?? 'auto') {
    if (!this._blob || this._blob.type !== mimetype) {
      if (this._blob) {
        this.setMimeType(mimetype);
      }
      this._blob = new Blob([ await this.data ], { type: this.mimetype });
    }
    return this._blob;
  }

  async textDecode(textDecoder: typeof TextDecoder): Promise<string> {
    return new textDecoder().decode(await this.data);
  }

  setMimeType(mimetype: MimeType) {
    this.mimetype = mimetype;
  }

  async toFile(useFullName = false): Promise<File> {
    return new File([ await this.data ], useFullName ? this.fullName : this.name, { type: this.mimetype });
  }

  async toBuffer(): Promise<Buffer> {
    return Buffer.from(await this.data);
  }

  toJSON() {
    return {
      mimetype: this.mimetype,
      byteLength: this._byteLength,
    };
  }

  /**
   * Clones the file.
   * @param name the new name of the file defaults to the current name
   * @param fullName the new full name of the file defaults to the current name. Will replace the name if it is changed.
   * @param deep true - the data is copied, false - the data is shared
   */
  async clone(name = this.name, fullName = this.fullName, deep = false) {
    if (name !== this.name && !fullName.endsWith(name)) {
      fullName.replace(new RegExp(`${this.name}$`), name);
    }
    const data = await this.data;
    return new VirtualFile(name, fullName, deep ? data.slice(0) : data);
  }

  async write(textContent: string, textEncoder: typeof TextEncoder): Promise<void>;
  async write(textContent: string): Promise<void>;
  async write(data: ArrayBuffer): Promise<void>;
  async write(textContentOrData: string | ArrayBuffer, textEncoder: typeof TextEncoder | undefined = this._textEncoder) {
    if (typeof textContentOrData === 'string') {
      await this.writeTextContent(textContentOrData, textEncoder);
    } else {
      await this.writeData(textContentOrData);
    }
    this._blob = null;
    this._textContent = null;
  }

  async writeTextContent(textContent: string, textEncoder: typeof TextEncoder | undefined = this._textEncoder) {
    if (this.mimetype !== undefined) {
      if (!isTextualMime(this.mimetype)) {
        throw new Error(`The mimetype '${ this.mimetype }' does not support text content`);
      }
    }
    if (!textEncoder) {
      throw new Error(`If write the text content, the text encoder must be provided.`);
    }
    const data = new textEncoder().encode(textContent);
    await this.writeData(data);
  }

  async writeData(data: ArrayBuffer) {
    this._data = data;
  }

  clear() {
    this._blob = null;
    this._textContent = null;
    this._byteLength = null;
    this._data = null;
    this._dataPromise = null;
  }

}
