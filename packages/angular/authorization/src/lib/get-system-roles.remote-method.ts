import { HttpRemoteMethod } from '@rxap/remote-method/http';
import { RxapRemoteMethod } from '@rxap/remote-method';
import { Injectable } from '@angular/core';

@RxapRemoteMethod({
  id: 'get-roles',
  url: 'roles.json',
  method: 'GET',
})
@Injectable()
export class GetSystemRolesRemoteMethod extends HttpRemoteMethod<Record<string, string[]>> {
}
