import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { ElementDef } from '@rxap/xml-parser/decorators';
import {
  HandleComponent,
  HandleComponentModule,
  ToValueContext
} from '@rxap-schematics/utilities';
import { Rule } from '@angular-devkit/schematics';

export interface DisplayColumn {
  name: string;
  hidden?: boolean;
  active?: boolean;
}

@ElementDef('feature')
export class FeatureElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __tag!: string;

  public static ColumnNoFilter(name: string, sticky: boolean = false): string {
    return `
    <ng-container matColumnDef="filter_${name}" ${sticky ? 'sticky' : ''}>
      <th mat-header-cell *matHeaderCellDef></th>
    </ng-container>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue(context?: ToValueContext): Rule {
    return () => {};
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return null;
  }

  public columnTemplate(): string {
    return '';
  }

  public columnTemplateFilter(): string {
    return '';
  }

  public footerTemplate(): string {
    return '';
  }

  public headerTemplate(): string {
    return '';
  }

  public tableTemplate(): string {
    return '';
  }

}
