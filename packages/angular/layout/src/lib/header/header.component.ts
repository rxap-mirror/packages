import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { Constructor } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import {
  HeaderService,
  ThemeService,
} from '@rxap/services';
import {
  MatOptionModule,
  ThemePalette,
} from '@angular/material/core';
import { RXAP_HEADER_COMPONENT } from '../tokens';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { StopPropagationDirective } from '@rxap/directives';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationProgressBarComponent } from './navigation-progress-bar/navigation-progress-bar.component';
import { UserProfileIconComponent } from './user-profile-icon/user-profile-icon.component';
import { AppsButtonComponent } from './apps-button/apps-button.component';

@Component({
  selector: 'rxap-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbarModule,
    NgClass,
    NgIf,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    LanguageSelectorComponent,
    MatFormFieldModule,
    StopPropagationDirective,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    DataSourceCollectionDirective,
    MatSlideToggleModule,
    AsyncPipe,
    NavigationProgressBarComponent,
    UserProfileIconComponent,
    AppsButtonComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  public sidenav?: MatSidenav;

  public components: Array<Constructor<any>> = [];

  public subscriptions = new Subscription();

  @Input()
  public color: ThemePalette = 'primary';

  public isDevMode = isDevMode();

  constructor(
    @Inject(HeaderService)
    public readonly headerComponentService: HeaderService,
    @Optional() @Inject(RXAP_HEADER_COMPONENT) public headerComponent: any,
    public readonly theme: ThemeService,
  ) {
  }

  public ngOnInit() {
    this.updateComponents();
    this.subscriptions.add(
      this.headerComponentService.update$
          .pipe(tap(() => this.updateComponents()))
          .subscribe(),
    );
  }

  public updateComponents(): void {
    this.components = this.headerComponentService.getComponents();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
