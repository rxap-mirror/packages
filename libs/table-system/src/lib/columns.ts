import { CssStyle } from '@rxap/utilities';

export enum ColumnAdjustTypes {
  DATA   = 'data',
  HEADER = 'header'
}

export type ColumnAdjustType = true | ColumnAdjustTypes;

export enum FooterOptionsContentTypes {
  TEXT_FILTER   = 'textFilter',
  SELECT_FILTER = 'selectFilter',
  SUMM_COLUMN   = 'summColumn',
}

export enum ColumnSortTypes {
  INT           = 'int',
  DATE          = 'date',
  STRING        = 'string',
  STRING_STRICT = 'string_strict',
  TEXT          = 'text',
  SERVER        = 'server',
  RAW           = 'row',
}

export type ColumnSort = ColumnSortTypes | ((a: any, b: any) => 1 | 0 | -1);

export interface FooterOptions {
  /**
   * the text label of the column footer
   */
  text: string;

  /**
   * the built-in filter or counter
   */
  content: FooterOptionsContentTypes;

  /**
   * the number of rows a cell should span
   */
  colspan: number;

  /**
   * the number of rows a cell should span
   */
  rowspan: number;

  /**
   * the name of a css class that will be applied to the column footer
   */
  css: string;

  /**
   * if set to true, switches the footer to the rotated state
   */
  rotate: boolean;

  /**
   * defines a custom height for the footer line
   */
  height: number;

  /**
   * adjusts the height of the footer to show its content
   */
  autoheight: boolean;
}

export interface RxapColumn {

  /**
   * adjusts the width of the column to fit the related content size.
   *
   * "data" - adjusts column width to the content of the widest item in it
   * "header" - adjusts column width to its header content
   * true - searches for the widest item among data and header(s) and adjusts column width to its content
   *
   */
  adjust: ColumnAdjustType;

  /**
   * limits the number of datatable rows that will be used in the calculation of
   * the maximum column width.
   */
  adjustBatch: number;

  /**
   * a value used for [`common.checkbox()`/`common.radio()` templates](https://docs.webix.com/datatable__controls.html) in the checked state
   */
  checkValue: any;

  /**
   * allows [specifying data source](https://docs.webix.com/datatable__columns_configuration.html#externaldatasourceforthecolumn) for the column or
   * filter/editor.
   */
  collection: string | object | any[] | Function;
  options: string | object | any[] | Function;

  /**
   * CSS that will be applied to the column.
   */
  css: CssStyle;

  /**
   * sets a function that takes a data property value as a parameter and returns
   * object with css properties (or the name of a css class) that will be applied
   * to a cell with the related value.
   * @param value
   * @param row
   * @param rowId
   * @param columnId
   */
  cssFormat: (value: any, row: any[], rowId: string, columnId: string) => CssStyle;

  /**
   * forces the column to widen for filling the unused table space.
   *
   * In case of numeric values other than 1 the columns will distribute the
   * available space proportionally according to the numbers.
   */
  fillspace: number | boolean;

  /**
   * the format of data presentation
   * @param value
   */
  format: (value: any) => any;

  /**
   * specifies the footer of the column. As an array, the footer can contain both string and object values.
   */
  footer: string | Array<string | Partial<FooterOptions>>;

  /**
   * specifies the header of the column. As an array, the header can contain both string and object values.
   */
  header: string | Array<string | Partial<FooterOptions>>;

  /**
   * hides a column initially
   */
  hidden: boolean;

  /**
   * the id of the column
   */
  id: string;

  /**
   * defines minimum width for the column. If there's more space initially or after resizing, column width will be increased, but it can never be less than the
   * minWidth value
   */
  minWidth: number;

  /**
   * defines maximum width for the column. If there is not enough space for the
   * specified width - the view will shrink down. During resizing the column
   * can't take the size bigger than the value of maxWidth
   */
  maxWidth: number;

  /**
   * enables sorting for the column (triggered by a single click on the header)
   * and assigns one of predefined sorting types or the name of a sorting function.
   */
  sort: ColumnSort;

  /**
   * the data template
   */
  template: string | Function;

  /**
   * a value used for `common.checkbox()`/`common.radio()` templates in the unchecked state
   */
  uncheckValue: any;

  /**
   * the width of the column
   */
  width: number;

}
