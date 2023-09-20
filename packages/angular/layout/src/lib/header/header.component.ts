import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatOptionModule,
  ThemePalette,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DataSourceCollectionDirective } from '@rxap/data-source/directive';
import { StopPropagationDirective } from '@rxap/directives';
import { HeaderService } from '@rxap/services';
import { Constructor } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RXAP_HEADER_COMPONENT } from '../tokens';
import { AppsButtonComponent } from './apps-button/apps-button.component';
import { NavigationProgressBarComponent } from './navigation-progress-bar/navigation-progress-bar.component';
import { SettingsButtonComponent } from './settings-button/settings-button.component';
import { UserProfileIconComponent } from './user-profile-icon/user-profile-icon.component';

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
    SettingsButtonComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  public sidenav?: MatSidenav;

  public components: Array<Constructor<any>> = [];

  public subscriptions = new Subscription();

  @Input()
  public color: ThemePalette = undefined;

  constructor(
    @Inject(HeaderService)
    public readonly headerComponentService: HeaderService,
    @Optional() @Inject(RXAP_HEADER_COMPONENT) public headerComponent: any,
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
