import { RxapElement } from './element';
import { FooterOptionsContentTypes } from '@rxap/table-system';
import { DeleteUndefinedProperties } from '@rxap/utilities';

export class Header {

  public static fromElement(element: RxapElement): Header {
    const header = new Header();

    if (element.textContent) {
      header.text = element.textContent;
    }

    header.text       = element.getString('text') || header.text;
    header.content    = element.getString('content') as any || header.content;
    header.colspan    = element.getNumber('colspan') || header.colspan;
    header.rowspan    = element.getNumber('rowspan') || header.rowspan;
    header.css        = element.getString('css') || header.css;
    header.rotate     = element.getBoolean('rotate') || header.rotate;
    header.height     = element.getNumber('height') || header.height;
    header.autoheight = element.getBoolean('autoheight') || header.autoheight;

    return header;
  }

  /**
   * the text label of the column footer
   */
  text?: string;

  /**
   * the built-in filter or counter
   */
  content?: FooterOptionsContentTypes;

  /**
   * the number of rows a cell should span
   */
  colspan?: number;

  /**
   * the number of rows a cell should span
   */
  rowspan?: number;

  /**
   * the name of a css class that will be applied to the column footer
   */
  css?: string;

  /**
   * if set to true, switches the footer to the rotated state
   */
  rotate: boolean = false;

  /**
   * defines a custom height for the footer line
   */
  height?: number;

  /**
   * adjusts the height of the footer to show its content
   */
  autoheight: boolean = false;

  public toConfig() {
    return DeleteUndefinedProperties({
      text:       this.text,
      content:    this.content,
      colspan:    this.colspan,
      rowspan:    this.rowspan,
      css:        this.css,
      rotate:     this.rotate,
      height:     this.height,
      autoheight: this.autoheight
    });
  }

}
