import { Pipe, PipeTransform } from '@angular/core';
import { SafeValue } from '@angular/platform-browser';
import { SantizationService } from './santization.service';

@Pipe({
  name: 'santization',
})
export class SantizationPipe implements PipeTransform {
  constructor(private readonly santizationService: SantizationService) {}

  transform(
    value: string,
    type: 'html' | 'style' | 'script' | 'url' | 'resourceUrl' = 'url',
  ): SafeValue {
    return this.santizationService.transform(value, type);
  }
}
