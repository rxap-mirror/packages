import { Option } from './option';
import {
  Control,
  CheckboxControl,
  FormFieldControl,
  DateControl,
  InputControl,
  RadioControl,
  SelectControl,
  SelectListControl,
  SelectOrCreateControl,
  TextareaControl
} from './control';
import { Group } from './group';
import { ArrayForm } from './array-form';
import { Form } from './form';
import {
  Row,
  Column,
  Layout
} from './layout';
import { Component } from './component';
import { Stepper } from './stepper';
import { Step } from './step';
import { RxapElement } from './element';

export type XmlElementName = string;
export type ControlCreatorFunction = (element: RxapElement) => Control;

export class Parser {

  public static ControlCreatorMap: Map<XmlElementName, ControlCreatorFunction> = new Map<XmlElementName, ControlCreatorFunction>();

  public static ParseComponent(element: RxapElement, component: Component): void {
    component.flex = element.getString('flex', component.flex);
  }

  public static CreateOptions(element: RxapElement): Option[] {

    Parser.isElement(element, 'options');

    return element.getChildren('option').map((option: RxapElement) => new Option(option.get('value'), option.textContent as any));

  }

  public static CreateGroup(element: RxapElement): Group {

    Parser.isElement(element, 'group');

    const group = new Group(element.getString('id')!);

    Parser.ParseComponent(element, group);

    return group;
  }

  public static CreateArray(element: RxapElement): ArrayForm {

    Parser.isElement(element, 'array');

    const array = new ArrayForm(element.getString('id')!);

    Parser.ParseComponent(element, array);

    return array;

  }

  public static CreateControl(element: RxapElement): Control {

    Parser.isElement(element, 'control');

    const control = new Control(element.getString('id')!);

    Parser.ParseControl(element, control);

    return control;

  }

  public static ParseControl(element: RxapElement, control: Control): void {

    Parser.ParseComponent(element, control);

    control.componentId = element.getString('componentId');
  }

  public static CreateCheckboxControl(element: RxapElement): CheckboxControl {

    Parser.isElement(element, 'checkbox-control');

    const control = new CheckboxControl(element.getString('id')!);

    Parser.ParseControl(element, control);

    control.indeterminate = element.getBoolean('indeterminate');
    control.labelPosition = element.getString('labelPosition') as any;

    return control;
  }

  public static ParseFormFieldControl(element: RxapElement, control: FormFieldControl): void {

    Parser.ParseControl(element, control);

    control.appearance = element.getString('appearance', control.appearance) as any;

  }

  public static CreateDateControl(element: RxapElement): DateControl {

    Parser.isElement(element, 'date-control');

    const control = new DateControl(element.getString('id')!);

    Parser.ParseFormFieldControl(element, control);

    control.startView = element.getString('startView') as any;
    control.startAt   = element.getDate('startAt');

    return control;

  }

  public static CreateInputControl(element: RxapElement): InputControl {

    Parser.isElement(element, 'input-control');

    const control = new InputControl(element.getString('id')!);

    Parser.ParseFormFieldControl(element, control);

    control.min     = element.getNumber('min');
    control.max     = element.getNumber('max');
    control.pattern = element.getString('pattern');
    control.type    = element.getString('type', control.type) as any;

    return control;

  }

  public static CreateRadioControl(element: RxapElement): RadioControl {

    Parser.isElement(element, 'radio-control');

    const control = new RadioControl(element.getString('id')!);

    Parser.ParseControl(element, control);

    control.color         = element.getString('control') as any;
    control.labelPosition = element.getString('labelPosition', control.labelPosition) as any;

    return control;

  }

  public static ParseSelectControl(element: RxapElement, control: SelectControl): void {
    Parser.ParseFormFieldControl(element, control);
    control.multiple = element.getBoolean('multiple');

    if (element.hasChild('options')) {
      control.options = this.CreateOptions(element.getChild('options')!);
    }

  }

  public static CreateSelectControl(element: RxapElement): SelectControl {

    Parser.isElement(element, 'select-control');

    const control = new SelectControl(element.getString('id')!);

    Parser.ParseSelectControl(element, control);

    return control;

  }

  public static CreateSelectListControl(element: RxapElement): SelectListControl {

    Parser.isElement(element, 'select-list-control');

    const control = new SelectListControl(element.getString('id')!);

    Parser.ParseSelectControl(element, control);

    control.checkboxPosition = element.getString('checkboxPosition', control.checkboxPosition) as any;

    return control;

  }

  public static CreateSelectOrCreateControl(element: RxapElement): SelectOrCreateControl {

    Parser.isElement(element, 'select-or-create-control');

    const control = new SelectOrCreateControl(element.getString('id')!);

    Parser.ParseSelectControl(element, control);

    control.createFormId = element.getString('createFormId');

    return control;

  }

  public static CreateTextareaControl(element: RxapElement): TextareaControl {

    Parser.isElement(element, 'textarea-control');

    const control = new TextareaControl(element.getString('id')!);

    Parser.ParseFormFieldControl(element, control);

    control.maxRows  = element.getNumber('maxRows');
    control.minRows  = element.getNumber('minRows');
    control.autosize = element.getBoolean('autosize', control.autosize);

    return control;

  }

  public static RegisterControlCreator(xmlElementName: XmlElementName, creatorFunction: ControlCreatorFunction): void {
    Parser.ControlCreatorMap.set(xmlElementName, creatorFunction);
  }

  public static IsControl(xmlElementName: XmlElementName): boolean {
    return Parser.ControlCreatorMap.has(xmlElementName);
  }

  public static AutoCreateControl(element: RxapElement): Control {
    const xmlElementName = element.name;

    if (Parser.ControlCreatorMap.has(xmlElementName)) {
      return Parser.ControlCreatorMap.get(xmlElementName)!(element);
    }

    throw new Error(`Control with name '${xmlElementName}' is not defined`);

  }

  public static ParseLayoutComponent(element: RxapElement, layout: Layout): void {

    Parser.ParseComponent(element, layout);

    layout.gap       = element.getString('gap', layout.gap);
    const horizontal = element.getString('horizontal');
    const vertical   = element.getString('vertical');
    if (horizontal && vertical) {
      layout.align = [ horizontal, vertical ].join(' ');
    }
  }

  public static CreateStep(element: RxapElement): Step {

    Parser.isElement(element, 'step');

    return new Step(
      element.getString('label'),
      Parser.CreateSaveChildComponents(element)
    );

  }

  public static CreateStepper(element: RxapElement): Stepper {

    Parser.isElement(element, 'stepper');

    const stepper = new Stepper(element.getChildren('step').map((step: RxapElement) => Parser.CreateStep(step)));

    Parser.ParseComponent(element, stepper);

    return stepper;
  }

  public static CreateRow(element: RxapElement): Row {
    const row = new Row(Parser.CreateChildComponents(element));

    Parser.ParseLayoutComponent(element, row);

    return row;
  }

  public static CreateColumn(element: RxapElement): Column {
    const column = new Column(Parser.CreateChildComponents(element));

    Parser.ParseLayoutComponent(element, column);

    return column;
  }

  public static CreateChildComponents(element: RxapElement): Component[] {
    const components: Component[] = [];

    for (const child of element.getAllChildNodes()) {

      switch (child.name) {

        case 'row':
          components.push(Parser.CreateRow(child));
          break;

        case 'column':
          components.push(Parser.CreateColumn(child));
          break;

        case 'group':
          components.push(Parser.CreateGroup(child));
          break;

        case 'array':
          components.push(Parser.CreateArray(child));
          break;

        case 'stepper':
          components.push(Parser.CreateStepper(child));
          break;

        default:
          components.push(Parser.AutoCreateControl(child));
          break;

      }

    }

    return components;
  }

  public static CreateSaveChildComponents(element: RxapElement): Component[] {

    const components: Component[] = [];

    let _controls: Control[] = [];

    for (const component of Parser.CreateChildComponents(element)) {

      if (component instanceof Control) {
        _controls.push(component);
      } else {
        if (_controls.length) {
          components.push(new Column(_controls));
          _controls = [];
        }
        components.push(component);
      }

    }

    if (_controls.length) {
      components.push(new Column(_controls));
    }

    return components;

  }

  public static CreateForm(element: RxapElement): Form {

    Parser.isElement(element, 'form');

    const form = new Form(
      element.getString('id'),
      Parser.CreateSaveChildComponents(element)
    );

    form.dataSource = element.getString('dataSource');
    form.title      = element.getString('title');
    form.subTitle   = element.getString('subTitle');

    return form;
  }

  public static CreateFormFromXml(xml: string): Form {

    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element);

    return Parser.CreateForm(root);

  }

  public static isElement(element: RxapElement, elementName: string): void {
    if (element.name !== elementName) {
      throw new Error();
    }
  }

}

Parser.RegisterControlCreator('control', Parser.CreateControl);
Parser.RegisterControlCreator('checkbox-control', Parser.CreateCheckboxControl);
Parser.RegisterControlCreator('date-control', Parser.CreateDateControl);
Parser.RegisterControlCreator('input-control', Parser.CreateInputControl);
Parser.RegisterControlCreator('radio-control', Parser.CreateRadioControl);
Parser.RegisterControlCreator('select-control', Parser.CreateSelectControl);
Parser.RegisterControlCreator('select-list-control', Parser.CreateSelectListControl);
Parser.RegisterControlCreator('select-or-create-control', Parser.CreateSelectOrCreateControl);
Parser.RegisterControlCreator('textarea-control', Parser.CreateTextareaControl);
