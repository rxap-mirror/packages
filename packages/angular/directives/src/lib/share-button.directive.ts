import {Directive, HostListener, Injectable, Input} from '@angular/core';
import {Required} from '@rxap/utilities';

@Injectable({providedIn: 'root'})
export class ShareService {

  public async share(data: { url?: string, text?: string, title?: string, files?: ReadonlyArray<File> }) {

    if (this.isShareSupported()) {

      if ((navigator as any).canShare(data)) {

        await (navigator as any).share(data);

      } else {
        console.debug('share data:', data);
        throw new Error('Can not share data. Data is invalid!');
      }

    } else {
      alert('Native share is not supported!');
    }

  }

  private isShareSupported(): boolean {
    return !!(navigator as any).share;
  }

}

@Directive({
  selector: '[rxapShareButton]',
  standalone: true,
})
export class ShareButtonDirective {

  @Input()
  public url!: string;

  @Input()
  public text!: string;

  @Input()
  @Required
  public title!: string;

  @Input()
  public files?: ReadonlyArray<File>;

  constructor(private readonly shareService: ShareService) {
  }

  @HostListener('click')
  public share() {
    this.shareService.share({url: this.url, text: this.text, files: this.files, title: this.title})
      .then(() => console.log('share successfully'))
      .catch(err => console.error('share failed', err.message));
  }

}


