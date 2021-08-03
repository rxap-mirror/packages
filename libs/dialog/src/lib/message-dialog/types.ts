import { ThemePalette } from '@rxap/utilities';

export interface MessageDialogData {
  message: string,
  actions: Array<{ type: string, label: string, color?: ThemePalette }>
}
