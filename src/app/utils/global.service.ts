import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  callbackLoadMapEmitter = new EventEmitter();

  callbackGetAddressEmitter = new EventEmitter();

  constructor() { }

  getToken() {
    return '';
  }

}
