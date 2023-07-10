import {InjectionToken} from '@angular/core';
import {OpenApiRemoteMethod} from '@rxap/open-api/remote-method';
import {BaseRemoteMethod} from '@rxap/remote-method';

export const ROW_ARCHIVE_METHOD = new InjectionToken<OpenApiRemoteMethod<any, {
  uuid: string
}>>('archive-remote-method');
export const ROW_RESTORE_METHOD = new InjectionToken<OpenApiRemoteMethod<any, {
  uuid: string
}>>('unarchive-remote-method');
export const ROW_DELETE_METHOD = new InjectionToken<OpenApiRemoteMethod<any, { uuid: string }>>('delete-remote-method');
export const ROW_EDIT_METHOD = new InjectionToken<BaseRemoteMethod<any, Record<string, any>>>('edit-remote-method');
export const ROW_VIEW_METHOD = new InjectionToken<BaseRemoteMethod<any, Record<string, any>>>('view-remote-method');
export const ROW_LINK_METHOD = new InjectionToken<BaseRemoteMethod<any, Record<string, any>>>('link-remote-method');
export const ROW_EDIT_LOADER_METHOD = new InjectionToken<BaseRemoteMethod<Record<string, any>, Record<string, any>>>('edit-loader-method');
