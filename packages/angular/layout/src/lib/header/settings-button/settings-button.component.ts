import {
  ComponentPortal,
  ComponentType,
  PortalModule,
} from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import {
  Component,
  Injector,
  isDevMode,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { ChangelogService } from '@rxap/ngx-changelog';
import {
  ThemeDensity,
  ThemeService,
} from '@rxap/ngx-theme';
import { Subscription } from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'rxap-settings-button',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, MatIconModule, LanguageSelectorComponent, MatMenuModule, PortalModule ],
  templateUrl: './settings-button.component.html',
  styleUrls: [ './settings-button.component.scss' ],
})
export class SettingsButtonComponent implements OnInit, OnDestroy {

  public isDevMode = isDevMode();
  items = signal<Array<ComponentPortal<unknown>>>([]);
  private _subscription?: Subscription;

  private savePreviewDensityValue = false;
  private currentDensityValue: ThemeDensity | null = null;

  private savePreviewTypographyValue = false;
  private currentTypographyValue: string | null = null;

  public readonly availableTypographies: string[];
  private savePreviewThemeValue = false;

  public readonly availableThemes: string[];
  private currentThemeValue: string | null = null;

  constructor(
    public readonly theme: ThemeService,
    private readonly route: ActivatedRoute,
    private readonly injector: Injector,
    private readonly changelogService: ChangelogService,
  ) {
    this.availableThemes = this.theme.getAvailableThemes();
    this.availableTypographies = this.theme.getAvailableTypographies();
  }

  ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  ngOnInit() {
    this._subscription = this.route.data.pipe(
      map(data => this.getCustomMenuItems(data)),
      map(items => items.map(item => new ComponentPortal(item, undefined, this.injector))),
      tap(items => this.items.set(items)),
    ).subscribe();
  }

  private getCustomMenuItems(data: any): Array<ComponentType<unknown>> {
    if (data?.layout?.header?.menu?.items?.length) {
      return data.layout.header.menu.items;
    }
    return [];
  }

  openChangelogDialog() {
    this.changelogService.showChangelogDialog();
  }

  previewDensity(density: ThemeDensity) {
    this.theme.applyDensity(density);
  }

  restoreDensity() {
    this.theme.applyDensity(this.theme.density());
  }

  setDensity(density: ThemeDensity) {
    this.theme.setDensity(density);
  }

  previewTypography(typography: string) {
    this.theme.applyTypography(typography);
  }

  restoreTypography() {
    this.theme.applyTypography(this.theme.typography());
  }

  setTypography(typography: string) {
    this.theme.setTypography(typography);
  }

  previewTheme(theme: string) {
    this.theme.applyTheme(theme);
  }

  restoreTheme() {
    this.theme.applyTheme(this.theme.themeName());
  }

  setTheme(theme: string) {
    this.theme.setTheme(theme);
  }

}
