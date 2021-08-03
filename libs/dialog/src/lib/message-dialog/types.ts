import { ThemePalette } from '@rxap/utilities';

export interface MessageDialogData {
  title: string;
  message: string,
  actions: Array<{ type: string, label: string, color?: ThemePalette }>
}
