export class Option {

  public static formElement(element: Element): Option {
    return new Option(element.getAttribute('value'), element.textContent as any);
  }

  constructor(
    public value: any,
    public display: string
  ) {}


}

export class Options {

  public static formElement(element: Element): Options {
    const options = new Options();

    element.childNodes.forEach((child: any) => {

      if (child.nodeName === 'option') {
        options.items.push(Option.formElement(child));
      }

    });

    return options;
  }

  public items: Option[] = [];

}
