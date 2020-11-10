import { Injectable } from '@angular/core';

String.prototype.proper = function() {
  // tslint:disable-next-line: only-arrow-functions
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  formatRouteId(id) {
    if (!id) { return 'Unknown'; }

    let result = '';
    id.split('_').forEach(word => {
      result += (result ? ' ' : '') + word.proper();
    });
    return result;
  }
  
}
