import { Pipe, PipeTransform, inject } from '@angular/core';
import { SafeValue } from '@angular/platform-browser';
import { SantizationService } from './santization.service';

@Pipe({
  name: 'santization',
  standalone: true,
})
export class SantizationPipe implements PipeTransform {
  private readonly santizationService = inject(SantizationService);


  transform(
    value: string | null,
    type: 'html' | 'style' | 'script' | 'url' | 'resourceUrl' = 'url',
  ): SafeValue | null {
    return this.santizationService.transform(value, type);
  }
}
