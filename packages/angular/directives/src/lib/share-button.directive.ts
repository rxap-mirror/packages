import {
  Directive,
  HostListener,
  inject,
  Injectable,
  input,
  output,
} from '@angular/core';

export interface ShareData {
  files?: File[];
  text?: string;
  title?: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {

  readonly isSupported = 'share' in navigator && 'canShare' in navigator && typeof navigator.canShare === 'function' && typeof navigator.share === 'function';

  async share(data: ShareData, softFail = true) {

    if (this.isSupported) {

      if (navigator.canShare(data)) {

        await navigator.share(data);

      } else {
        console.warn('Can not share data', data);
        throw new Error('Can not share data');
      }

    } else if (softFail) {
      console.warn(`Native share is not supported!`);
    } else {
      alert('Native share is not supported!');
    }

  }

}

@Directive({
  selector: '[rxapShareButton],[rxapShare]',
  standalone: true,
})
export class ShareButtonDirective {

  readonly url = input<string>();
  readonly text = input<string>();
  readonly title = input<string>();
  readonly files = input<File[] | undefined>();

  readonly failed = output<any>();
  readonly success = output<void>();

  private readonly shareService = inject(ShareService);

  @HostListener('click')
  async share() {
    try {
      await this.shareService.share({
        url: this.url(),
        text: this.text(),
        files: this.files(),
        title: this.title(),
      });
      this.success.emit();
    } catch (err: any) {
      console.error(`share failed: ${ err.message }`);
      this.failed.emit(err);
    }
  }

}


