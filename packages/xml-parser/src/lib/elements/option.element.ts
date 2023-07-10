import {ControlOption, ControlOptions} from '@rxap/utilities';
import {DataSourceElement} from './data-source.element';
import {ParsedElement} from './parsed-element';
import {ElementDef} from '../decorators/element-def';
import {ElementAttribute} from '../decorators/element-attribute';
import {ElementTextContent} from '../decorators/element-text-content';
import {ElementRequired} from '../decorators/mixins/required-element.parser.mixin';
import {ElementChildren} from '../decorators/element-children';
import {ElementChild} from '../decorators/element-child';

@ElementDef('option')
export class OptionElement implements ParsedElement<ControlOption> {

  @ElementAttribute()
  public value?: any;

  @ElementTextContent()
  @ElementRequired()
  public display!: string;

  @ElementAttribute()
  public i18n?: string;

  public getControlOption(): ControlOption {
    return {
      value: this.value ?? this.display,
      display: this.display,
      i18n: this.i18n,
    };
  }

  public validate(): boolean {
    return true;
  }

}

@ElementDef('to-display')
export class OptionToDisplayElement implements ParsedElement {

  @ElementTextContent({
    required: true,
  })
  public template!: string;

  public validate(): boolean {
    return true;
  }

}

@ElementDef('options')
export class OptionsElement implements ParsedElement {

  @ElementChildren(OptionElement)
  public options!: OptionElement[];

  @ElementChild(OptionToDisplayElement)
  public toDisplay?: OptionToDisplayElement;

  @ElementChild(DataSourceElement)
  public dataSource?: DataSourceElement;

  public getControlOptions(): ControlOptions<any> {
    return this.options.map(option => option.getControlOption());
  }

  public validate(): boolean {
    return this.options.length !== 0 || !!this.dataSource;
  }

}
