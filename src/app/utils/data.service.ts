import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  source: any;

  url: any;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  pushOneway(url) {
    if (typeof(EventSource) !== 'undefined') {      
      this.source = new EventSource(url);

      this.source.onopen = () => {
        console.log('Connection is open with url: ', url);
      };

      this.source.onerror = (err: any) => {
        if (err.readyState === EventSource.CLOSED) {
          console.log('Connection was closed. ');
        }
      };
    } else {
      console.log('Error at callback_PushCurrentLocation_Emitter: ', 'Your browser does not support server-sent events...');
    }
  }

  pushTwoway(url, callback = null) {
    if (typeof(EventSource) !== 'undefined') {      
      this.source = new EventSource(url);

      this.source.onopen = () => {
        console.log('Connection is open with url: ', url);
      };

      this.source.onmessage = (event) => {
        if (callback) {
          const data = JSON.parse(event.data);
          callback(data);
        }
      };

      this.source.onerror = (err: any) => {
        if (err.readyState === EventSource.CLOSED) {
          console.log('Connection was closed. ');
        }
      };
    } else {
      console.log('Error at callback_PushCurrentLocation_Emitter: ', 'Your browser does not support server-sent events...');
    }
  }

  pushWatching(url, parameter) {
    if (parameter.userType !== 'driver') { return; }

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const item = {
          userid: parameter.userid,
          userType: 'driver',
          latitude: parameter.latitude,
          longtitude: parameter.longtitude
        };

        const source = new EventSource(url, );
      });
    } else {
      console.log('Error at callback_WatchingDrivers_Emitter: ', 'Geolocation is not supported by this browser.');
    }
  }

  get(url, callback = null) {
    this.http.get(url).subscribe((value) => {
      if (!callback) { return; }
      callback(value);
    });
  }

  post(url, params, callback = null) {
    this.http.post(url, params).subscribe((value) => {
      if (!callback) { return; }
      callback(value);
    });
  }

  patch(url, params, callback = null) {
    this.http.patch(url, params).subscribe((value) => {
      if (!callback) { return; }
      callback(value);
    });
  }

  put(url, params, callback = null) {
    this.http.put(url, params).subscribe((value) => {
      if (!callback) { return; }
      callback(value);
    });
  }


}
