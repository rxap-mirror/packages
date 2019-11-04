import { TextFilterService } from './text-filter.service';
import { Injectable } from '@angular/core';
import { ControlOption } from '@rxap/utilities';

@Injectable()
export class OptionTextFilterService extends TextFilterService {

  public compare(filterValue: string, item: ControlOption<any>): boolean {
    return super.compare(filterValue, item.display);
  }

}
