import { Layout } from './layout';
import { Control } from './control';
import { Stepper } from './stepper';
import { Step } from './step';
import { Component } from './component';

export function LayoutFromElement(element: Element) {
  const layout = new Layout();
  layout.align = element.getAttribute('align') || '';
  layout.gap = element.getAttribute('gap') || '0px';
  layout.orientation = element.nodeName as any;
  layout.components.push(...getComponentsFromElement(element));

  return layout;
}

export function StepperFromElement(element: Element) {
  const stepper = new Stepper();

  element.childNodes.forEach((child: any) => {

    if (child.nodeName === 'step') {
      stepper.components.push(StepFromElement(child));
    }

  });

  return stepper;
}

export function StepFromElement(element: Element) {


  const label = element.getAttribute('label');

  if (!label) {
    throw new Error('label is required for the step element');
  }

  const step = new Step(new Layout(), label);

  step.layout.orientation = element.getAttribute('layout') as any || 'column';
  step.layout.gap         = element.getAttribute('gap') || '0px';
  step.layout.align       = element.getAttribute('align') || '';
  step.layout.components.push(...getComponentsFromElement(element));

  return step;
}

export function getComponentsFromElement(element: Element): Array<Component> {

  const components: Array<Stepper | Layout | Control> = [];

  element.childNodes.forEach((child: any) => {

    switch (child.nodeName) {

      case 'row': case 'column':
        components.push(LayoutFromElement(child));
        break;

      case 'control':
        components.push(Control.fromElement(child));
        break;

      case 'stepper':
        components.push(StepperFromElement(child));
        break;

    }

  });

  return components;

}

export function FromXml(xml: string): Layout {
  const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

  const root = xmlDoc.childNodes.item(0) as Element;

  switch (root.nodeName) {
    case 'stepper':
      const layout = new Layout();
      layout.orientation = 'column';
      layout.components.push(StepperFromElement(root));
      return layout;

    default:
      return LayoutFromElement(root);
  }
}
