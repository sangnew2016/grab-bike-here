import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  formatRouteId(id) {
    if (!id) { return 'Unknown'; }

    let result = '';
    id.split('_').forEach(word => {
      result += (result ? ' ' : '') + this.proper(word);
    });
    return result;
  }

  proper(str) {
    // tslint:disable-next-line: only-arrow-functions
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

}
