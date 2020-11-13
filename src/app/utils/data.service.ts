import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  push(url, position = {}) {
    if (typeof(EventSource) !== 'undefined') {
      const source = new EventSource(url);
    } else {
      console.log('Error at callback_PushCurrentLocation_Emitter: ', 'Your browser does not support server-sent events...');
    }
  }

  pushWatching(url) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const item = {
          userid: 'sangthach',
          latitude: '',
          longtitude: ''
        };

        const source = new EventSource(url);
      });
    } else {
      console.log('Error at callback_WatchingDrivers_Emitter: ', 'Geolocation is not supported by this browser.');
    }
  }
}
