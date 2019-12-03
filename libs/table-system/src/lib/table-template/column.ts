import {
  ColumnAdjustType,
  ColumnSort
} from '@rxap/table-system';
import {
  CssStyle,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import { Header } from './header';
import { RxapTableDefinition } from '../definition/table-definition';

export class Column {

  /**
   * adjusts the width of the column to fit the related content size.
   *
   * "data" - adjusts column width to the content of the widest item in it
   * "header" - adjusts column width to its header content
   * true - searches for the widest item among data and header(s) and adjusts column width to its content
   *
   */
  public adjust?: ColumnAdjustType;

  /**
   * CSS that will be applied to the column.
   */
  public css?: CssStyle;

  /**
   * specifies the header of the column. As an array, the header can contain both string and object values.
   */
  public header: Header[] = [];

  /**
   * specifies the footer of the column. As an array, the footer can contain both string and object values.
   */
  public footer: Header[] = [];

  /**
   * the id of the column
   */
  public id!: string;

  /**
   * defines minimum width for the column. If there's more space initially or after resizing, column width will be increased, but it can never be less than the
   * minWidth value
   */
  public minWidth?: number;

  /**
   * defines maximum width for the column. If there is not enough space for the
   * specified width - the view will shrink down. During resizing the column
   * can't take the size bigger than the value of maxWidth
   */
  public maxWidth?: number;

  /**
   * enables sorting for the column (triggered by a single click on the header)
   * and assigns one of predefined sorting types or the name of a sorting function.
   */
  public sort?: ColumnSort;

  /**
   * the width of the column
   */
  public width?: number;

  public propertyKey!: string;

  public toConfig() {
    return DeleteUndefinedProperties({
      adjust:   this.adjust,
      css:      this.css,
      header:   this.header.map(header => header.toConfig()),
      footer:   this.footer.map(footer => footer.toConfig()),
      id:       this.id,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      sort:     this.sort,
      width:    this.width
    });
  }

  public apply(tableDefinition: RxapTableDefinition<any>): void {
    (tableDefinition as any)[ this.propertyKey ] = this.toConfig();
    tableDefinition.__columnsKeys.push(this.propertyKey);
  }

}
