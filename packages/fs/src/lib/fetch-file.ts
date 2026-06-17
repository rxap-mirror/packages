import {
  BinaryMime,
  TextualMime,
  VirtualFileLike,
  MimeType,
  isTextualMime,
} from './virtual-file';

export class FetchFile implements VirtualFileLike {
  get data(): Promise<ArrayBuffer> {
    return this._arrayBuffer ?? this.fetch();
  }
  private _textContent: string | null = null;
  private _blob: Blob | null = null;
  private _arrayBuffer: Promise<ArrayBuffer> | null = null;

  get name(): string {
    return this.fullName.split('/').pop()!;
  }

  constructor(
    public readonly fullName: string,
    public readonly url: string,
    public mimetype?: string
  ) {}

  async getContent(mimetype: TextualMime): Promise<string>;
  async getContent(mimetype: BinaryMime): Promise<Blob>;
  async getContent(mimetype?: MimeType): Promise<string | Blob>;
  async getContent(mimetype: MimeType = this.mimetype ?? 'auto'): Promise<string | Blob> {
    let blob: Blob;
    if (this._blob?.type === mimetype) {
      blob = this._blob;
    } else {
      const data = await this.data;
      this._blob = blob = new Blob([data], { type: mimetype });
    }
    if (isTextualMime(mimetype)) {
      if (!this._textContent) {
        const data = await this.data;
        this._textContent = new TextDecoder().decode(data);
      }
      return this._textContent;
    }
    return blob;
  }

  protected async fetch(): Promise<ArrayBuffer> {
    console.debug('fetch', this.url, '...');
    const promise = fetch(this.url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${this.url}: ${response.status} ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type') ?? undefined;
      if (contentType) {
        // normalize to the bare mime without any charset, etc.
        const normalized = contentType.split(';')[0].trim();
        // only override if unknown or different
        if (!this.mimetype || this.mimetype !== normalized) {
          console.debug('fetch', this.url, 'content-type', contentType, '=>', normalized);
          this.mimetype = normalized;
        }
      }
      // read the ArrayBuffer directly and derive the cached blob from it
      // (avoids the redundant blob -> arrayBuffer round trip)
      const buffer = await response.arrayBuffer();
      this._blob = new Blob([ buffer ], { type: this.mimetype });
      return buffer;
    }).catch((error) => {
      // never cache a rejected promise, otherwise every later access fails forever
      this._arrayBuffer = null;
      throw error;
    });
    return (this._arrayBuffer = promise);
  }

  setMimeType(mimetype: string) {
    this.mimetype = mimetype;
  }

  async toFile(useFullName = false): Promise<File> {
    const data = await this.data;
    return new File([data], useFullName ? this.fullName : this.name, {
      type: this.mimetype,
    });
  }

  toJSON() {
    return {
      name: this.name,
      fullName: this.fullName,
      mimetype: this.mimetype,
      url: this.url,
    };
  }
}
