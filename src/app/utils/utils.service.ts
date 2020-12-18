import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  public localStorage = {
    get: this._get,
    set: this._set,
    clear: this._clear
  };

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

  clone(value) {
    return JSON.parse(JSON.stringify(value));
  }


  /**
   *
   * @param key Two methods for LocalStorage: get | set
   */
  private _get(key) {
    const value = localStorage.getItem(key);
    return JSON.parse(value);
  }

  private _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private _clear() {
    localStorage.clear();
  }

}
