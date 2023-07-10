import { ThemePalette } from '@angular/material/core';

export interface MessageDialogData {
  title: string;
  message: string,
  actions: Array<{ type: string, label: string, color: ThemePalette }>
}
