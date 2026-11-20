import {
  ChangeDetectorRef,
  Directive,
  Inject,
  INJECTOR,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  input
} from '@angular/core';
import {
  Constructor,
  ControlOption,
  ControlOptions,
} from '@rxap/utilities';
import { NgControl } from '@angular/forms';
import {
  FormDefinition,
  RxapFormControl,
} from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import {
  BaseRemoteMethod,
  RemoteMethodLoader,
} from '@rxap/remote-method';
import { IdOrInstanceOrToken } from '@rxap/definition';
import {
  getMetadata,
  setMetadataMapMap,
} from '@rxap/reflect-metadata';
import { RxapFormSystemError } from '../error';
import { ExtractFormDefinitionMixin } from '../mixins/extract-form-definition.mixin';

export interface OptionsFromRemoteMethodTemplateContext {
  $implicit: ControlOption;
}

export const REMOTE_METHOD_NAME = 'options';

export const RXAP_USE_REMOTE_METHOD = 'rxap/form-system/remote-method/use';

export function UseRemoteMethod(remoteMethod: Constructor<BaseRemoteMethod>, name: string) {
  return function (target: any, propertyKey: string) {
    setMetadataMapMap(propertyKey, name, remoteMethod, RXAP_USE_REMOTE_METHOD, target);
  };
}

export function UseOptionsRemoteMethod(dataSource: Constructor<BaseRemoteMethod<ControlOptions>>) {
  return function (target: any, propertyKey: string) {
    UseRemoteMethod(dataSource, REMOTE_METHOD_NAME)(target, propertyKey);
  };
}

export class ExtractRemoteMethodsMixin {

  protected extractRemoteMethods(
    formDefinition: FormDefinition,
    controlId: string,
  ): Map<string, Constructor<IdOrInstanceOrToken<BaseRemoteMethod>>> {
    const map = getMetadata<Map<string, Map<string, Constructor<IdOrInstanceOrToken<BaseRemoteMethod>>>>>(
      RXAP_USE_REMOTE_METHOD,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError(
        'Could not extract the use remote method map from the form definition instance',
        '',
      );
    }

    if (!map.has(controlId)) {
      throw new RxapFormSystemError(
        'A use remote method definition does not exists in the form definition metadata',
        '',
      );
    }

    return map.get(controlId)!;
  }

}

export interface OptionsFromRemoteMethodDirective<Value, Parameters> extends OnInit,
                                                                             ExtractFormDefinitionMixin,
                                                                             ExtractRemoteMethodsMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractRemoteMethodsMixin)
@Directive({
  selector: '[rxapOptionsFromRemoteMethod]',
  standalone: true,
})
export class OptionsFromRemoteMethodDirective<Value, Parameters> implements OnChanges {

  public readonly parameters = input<Parameters>(undefined, { alias: "rxapOptionsFromRemoteMethodParameters" });

  public readonly resetOnChange = input<Value>(undefined, { alias: "rxapOptionsFromRemoteMethodResetOnChange" });

  public readonly withoutParameters = input(false, { alias: "rxapOptionsFromRemoteMethodWithoutParameters" });

  private remoteMethodToken!: IdOrInstanceOrToken<BaseRemoteMethod>;

  constructor(
    @Inject(NgControl)
    private readonly ngControl: NgControl,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<OptionsFromRemoteMethodTemplateContext>,
    @Inject(RemoteMethodLoader)
    private readonly remoteMethodLoader: RemoteMethodLoader,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnChanges(changes: SimpleChanges) {
    const parametersChanges = changes['parameters'];
    if (parametersChanges) {
      if (!this.remoteMethodToken) {
        this.remoteMethodToken = this.extractRemoteMethodToken();
      }
      this.renderTemplate(parametersChanges.currentValue);
    }
    if (changes['withoutParameters']?.currentValue) {
      if (!this.remoteMethodToken) {
        this.remoteMethodToken = this.extractRemoteMethodToken();
      }
      this.renderTemplate();
    }
  }

  private extractRemoteMethodToken() {
    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

    const formDefinition = this.extractFormDefinition(control);

    const remoteMethodsTokens = this.extractRemoteMethods(formDefinition, control.controlId);

    if (!remoteMethodsTokens.has(REMOTE_METHOD_NAME)) {
      throw new Error(`The remote method with the name 'options' is not defined`);
    }

    return remoteMethodsTokens.get(REMOTE_METHOD_NAME)!;
  }

  private async renderTemplate(parameters?: Parameters) {

    const options = await this.remoteMethodLoader.call$(this.remoteMethodToken, parameters, undefined, this.injector);

    this.viewContainerRef.clear();

    for (const option of options) {
      this.viewContainerRef.createEmbeddedView(this.template, { $implicit: option });
    }

    const resetOnChange = this.resetOnChange();
    if (resetOnChange !== undefined) {
      this.ngControl.reset(resetOnChange);
    }

    this.cdr.detectChanges();

  }

}


