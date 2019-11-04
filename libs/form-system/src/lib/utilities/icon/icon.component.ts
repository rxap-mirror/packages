import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';

@Component({
  selector:        'rxap-icon',
  templateUrl:     './icon.component.html',
  styleUrls:       [ './icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:   ViewEncapsulation.None
})
export class IconComponent {

  public get isSimpleIcon(): boolean {
    return typeof this.icon === 'string';
  }

  public get complexIcon(): IconConfig {
    return this.icon as any;
  }

  public get simpleIcon(): string {
    return this.icon as any;
  }

  @Input() public icon: string | IconConfig | null = null;

}
