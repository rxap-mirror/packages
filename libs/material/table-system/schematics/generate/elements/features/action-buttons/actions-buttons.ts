import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ArchiveActionElement } from './archive-action.element';
import { DeleteActionElement } from './delete-action.element';
import { RestoreActionElement } from './restore-action.element';
import { ViewActionElement } from './view-action.element';
import { ActionButtonElement } from './action-button.element';
import { EditActionElement } from './edit-action.element';
import { ActionButtonsElement } from './action-buttons.element';

export const ActionsButtons: Array<Constructor<ParsedElement>> = [
  ArchiveActionElement,
  DeleteActionElement,
  RestoreActionElement,
  ViewActionElement,
  ActionButtonElement,
  EditActionElement,
  ActionButtonsElement
];
