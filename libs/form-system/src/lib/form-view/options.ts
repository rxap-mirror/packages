export class Option {

  public static formElement(element: Element): Option {
    let value: any = element.getAttribute('value');

    // test if number
    if (!isNaN(Number(value))) {
      value = Number(value);
    }

    if (value === 'true') {
      value = true;
    }

    if (value === 'false') {
      value = false;
    }

    if (value === 'null') {
      value = null;
    }

    if (typeof value === 'string') {

      // test if string
      if (value[ 0 ] === '\'' && value[ value.length - 1 ] === '\'') {
        value = value.substr(1, value.length - 2);
      } else {
        try { value = JSON.parse(value); } finally {}
      }

    }

    return new Option(value, element.textContent as any);
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
