import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  SanitizerService,
  SanitizerType
} from './sanitizer.service';
import {
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl
} from '@angular/platform-browser';

@Pipe({
  name: 'sanitizer'
})
export class SanitizerPipe implements PipeTransform {

  constructor(private readonly sanitizer: SanitizerService) {}

  public transform(value: string, type: SanitizerType): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    return this.sanitizer.bypass(value, type);
  }

}
