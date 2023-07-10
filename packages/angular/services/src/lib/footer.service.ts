import {
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  isDevMode,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {Constructor} from '@rxap/utilities';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ComponentPortal, Portal, TemplatePortal} from '@angular/cdk/portal';
import {map} from 'rxjs/operators';

export interface FooterComponentOptions extends Record<string, any> {
  order?: number;
  injector?: Injector;
  start?: boolean;
  end?: boolean;
}

export interface FooterTemplateOptions extends Record<string, any> {
  order?: number;
  start?: boolean;
  end?: boolean;
}

export const RXAP_FOOTER_COMPONENT = new InjectionToken('rxap/services/footer-component');

export interface FooterComponent extends FooterComponentOptions {
  component: Constructor;
}

export interface FooterTemplate extends FooterTemplateOptions {
  template: TemplateRef<any>;
}

export function IsFooterTemplate(obj: any): obj is FooterTemplate {
  return !!obj && !!obj['template'];
}

export function IsFooterComponent(obj: any): obj is FooterComponent {
  return !!obj && !!obj['component'];
}

@Injectable({providedIn: 'root'})
export class FooterService {

  /**
   * @deprecated removed
   */
  public readonly update$ = new Subject<void>();
  public portals$ = new BehaviorSubject<Array<Portal<any>>>([]);
  public portalCount$: Observable<number> = this.portals$.pipe(map(portals => portals.length));
  private components: FooterComponent[] = [];
  private templates: FooterTemplate[] = [];
  private componentPortalMap = new WeakMap<Constructor, Portal<any>>();
  private templatePortalMap = new WeakMap<TemplateRef<any>, Portal<any>>();

  constructor(@Optional() @Inject(RXAP_FOOTER_COMPONENT) footerComponents: any | any[] | null = null) {
    if (footerComponents) {
      if (isDevMode()) {
        console.warn('The RXAP_FOOTER_COMPONENT InjectionToken is deprecated and will be removed in the feature!');
      }
      if (Array.isArray(footerComponents)) {
        footerComponents.forEach((comp, index) => this.addComponent(comp, {order: index}, true));
      } else {
        this.addComponent(footerComponents, {order: 0}, true);
      }
    }
  }

  /**
   * @deprecated removed
   */
  public get countComponent(): number {
    return this.components.length;
  }

  /**
   * @deprecated removed
   */
  public get countComponents(): number {
    return this.components.length;
  }

  /**
   * @deprecated removed
   */
  public get hasComponents(): boolean {
    return this.countComponents !== 0;
  }

  /**
   * @deprecated removed
   */
  public get hasComponentsOrTemplates(): boolean {
    return this.hasComponents || this.hasTemplates;
  }

  /**
   * @deprecated removed
   */
  public get countTemplates(): number {
    return this.templates.length;
  }

  /**
   * @deprecated removed
   */
  public get hasTemplates(): boolean {
    return this.countTemplates !== 0;
  }

  public pushPortal(portal: Portal<any>) {
    if (!this.portals$.value.includes(portal)) {
      this.portals$.next([...this.portals$.value, portal]);
    } else {
      if (isDevMode()) {
        console.warn('Can not add the same portal multiple times');
      }
    }
  }

  public removePortal(portal: Portal<any>) {
    const index = this.portals$.value.indexOf(portal);
    if (index !== -1) {
      const portals = [...this.portals$.value];
      portals.splice(index, 1);
      this.portals$.next(portals);
    }
  }

  /**
   * @deprecated removed
   */
  public addComponent(component: Constructor, options: FooterComponentOptions = {order: 0}, silent = false): void {
    this.components.push({...options, component});

    if (!silent) {
      this.update$.next();
    }
    const portal = new ComponentPortal(component, null, options.injector);
    this.pushPortal(portal);
    this.componentPortalMap.set(component, portal);
  }

  /**
   * @deprecated removed
   */
  public removeComponent(component: Constructor<any>): void {
    this.components = this.components.filter(coi => coi.component !== component);
    this.update$.next();
    const portal = this.componentPortalMap.get(component);
    if (portal) {
      this.componentPortalMap.delete(component);
      this.removePortal(portal);
    }
  }

  /**
   * @deprecated removed
   */
  public addTemplate(
    template: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    options: FooterComponentOptions = {order: 0},
    silent = false,
  ): void {
    this.templates.push({...options, template});

    if (!silent) {
      this.update$.next();
    }
    const portal = new TemplatePortal(template, viewContainerRef);
    this.pushPortal(portal);
    this.templatePortalMap.set(template, portal);
  }

  /**
   * @deprecated removed
   */
  public removeTemplate(template: TemplateRef<any>): void {
    this.templates = this.templates.filter(temp => temp.template !== template);
    this.update$.next();
    const portal = this.templatePortalMap.get(template);
    if (portal) {
      this.removePortal(portal);
      this.templatePortalMap.delete(template);
    }
  }

  /**
   * @deprecated removed
   */
  public getComponents(): FooterComponent[] {
    return this
      .components
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * @deprecated removed
   */
  public getTemplates(): FooterTemplate[] {
    return this
      .templates
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * @deprecated removed
   */
  public getComponentsAndTemplates(): Array<FooterComponent | FooterTemplate> {
    return [...this.templates, ...this.components]
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

}
