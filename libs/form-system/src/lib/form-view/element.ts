import { Layout } from './layout';
import { Control } from './control';
import { Stepper } from './stepper';
import { Step } from './step';

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

  element.childNodes.forEach((child: Element) => {

    if (child.nodeName === 'step') {
      stepper.steps.push(StepFromElement(child));
    }

  });

  return stepper;
}

export function StepFromElement(element: Element) {
  const step = new Step();

  step.label = element.getAttribute('label');

  step.layout             = new Layout();
  step.layout.orientation = element.getAttribute('layout') as any || 'column';
  step.layout.gap         = element.getAttribute('gap') || '0px';
  step.layout.align       = element.getAttribute('align') || '';
  step.layout.components.push(...getComponentsFromElement(element));

  return step;
}

export function getComponentsFromElement(element): Array<Stepper | Layout | Control> {

  const components: Array<Stepper | Layout | Control> = [];

  element.childNodes.forEach((child: Element) => {

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
