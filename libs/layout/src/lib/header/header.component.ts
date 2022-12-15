import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  Optional,
  Inject,
} from '@angular/core';
import { Constructor } from '@rxap/utilities';
import { Subscription, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from '@rxap/authentication';
import { RXAP_HEADER_COMPONENT } from '../tokens';
import { HeaderService } from '@rxap/services';
import { MatLegacyMenuPanel as MatMenuPanel } from '@angular/material/legacy-menu';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'rxap-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rxap-layout-header',
  },
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  public sidenav?: MatSidenav;

  public components: Array<Constructor<any>> = [];

  public subscriptions = new Subscription();

  public hasUser$: Observable<boolean>;

  @Input()
  public color: ThemePalette = 'primary';

  @Input()
  public settingsMenuPanel?: MatMenuPanel;

  constructor(
    @Inject(HeaderService)
    public readonly headerComponentService: HeaderService,
    @Inject(UserService)
    private readonly userService: UserService<any>,
    @Optional() @Inject(RXAP_HEADER_COMPONENT) public headerComponent: any
  ) {
    this.hasUser$ = this.userService.user$.pipe(map(Boolean));
  }

  public ngOnInit() {
    this.updateComponents();
    this.subscriptions.add(
      this.headerComponentService.update$
        .pipe(tap(() => this.updateComponents()))
        .subscribe()
    );
  }

  public updateComponents(): void {
    this.components = this.headerComponentService.getComponents();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
