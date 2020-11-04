import {
  ControlOptions,
  ControlOption,
} from '@rxap/utilities';
import { compile } from 'handlebars';
import {
  ElementTextContent,
  ElementChild,
  ElementChildren,
  ElementChildTextContent,
  ElementAttribute,
  ElementRequired,
  ElementDef
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { DataSourceElement } from './data-source.element';

@ElementDef('option')
export class OptionElement implements ParsedElement<ControlOption> {

  @ElementAttribute()
  public value?: any;

  @ElementTextContent()
  @ElementRequired()
  public display!: string;

  @ElementAttribute()
  public i18n?: boolean;

  public getControlOption(): ControlOption {
    return {
      value:   this.value ?? this.display,
      display: this.display,
      i18n:    this.i18n
    };
  }

  public validate(): boolean {
    return true;
  }

}

@ElementDef('to-display')
export class OptionToDisplayElement implements ParsedElement {

  @ElementTextContent({
    required: true
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
