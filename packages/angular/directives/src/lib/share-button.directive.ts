import {
  Directive,
  inject,
  Injectable,
  input,
  output,
} from '@angular/core';
import { Showcase } from '@ng-prism/core';

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

@Showcase<ShareButtonDirective>({
  title: 'Share Button',
  category: 'Directives',
  description: 'Opens the native share dialog of the browser with the configured data when the host element is clicked. Where the Web Share API is not supported, a warning is logged instead.',
  status: 'stable',
  host: '<button type="button">Share</button>',
  variants: [
    { name: 'Link', inputs: { url: 'https://rxap.dev', title: 'RxAP', text: 'Reactive Application Platform' } },
    { name: 'Text only', inputs: { text: 'Check out the RxAP styleguide' } },
  ],
})
@Directive({
  selector: '[rxapShareButton],[rxapShare]',
  standalone: true,
  host: {
    '(click)': 'share()',
  },
})
export class ShareButtonDirective {

  readonly url = input<string>();
  readonly text = input<string>();
  readonly title = input<string>();
  readonly files = input<File[] | undefined>();

  readonly failed = output<any>();
  readonly success = output<void>();

  private readonly shareService = inject(ShareService);

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


