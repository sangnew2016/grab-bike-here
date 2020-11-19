import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient, private storage: Storage) { }

  source: any = null;
  sourceWatching: any = null;

  url: any;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  pushOneway(url) {
    if (typeof(EventSource) !== 'undefined' && !this.source) {
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
    if (typeof(EventSource) !== 'undefined' && !this.source) {
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
    let keepPosition: any = null;

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        if (typeof(EventSource) === 'undefined') {
          console.log('Error at callback_WatchingDrivers_Emitter: ', 'Your browser does not support server-sent events...');
          return;
        }

        // No action, if have no change position
        if (keepPosition &&
                keepPosition.coords.latitude === position.coords.latitude &&
                keepPosition.coords.longitude === position.coords.longitude)
        {
          // nothing to do
        } else {
          keepPosition = position;

          // create rest-api to push new position of driver
          const item = {
            email: parameter.email,
            userType: parameter.userType,
            latitude: position.coords.latitude + '',
            longtitude: position.coords.longitude + ''
          };
          this.put(url, item);
        }

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





  getAuth(url, callback = null) {
    const fn = (token) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', token);

      this.http.get(url, { headers }).subscribe((value) => {
        if (!callback) { return; }
        callback(value);
      });
    };

    this.storage.get('token').then(fn);
  }

  postAuth(url, params, callback = null) {
    const fn = (token) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', token);

      this.http.post(url, params, { headers }).subscribe((value) => {
        if (!callback) { return; }
        callback(value);
      });
    };

    this.storage.get('token').then(fn);
  }

  putAuth(url, params, callback = null) {
    const fn = (token) => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token
        })
      };

      this.http.put(url, params, httpOptions).subscribe((value) => {
        if (!callback) { return; }
        callback(value);
      });
    };

    this.storage.get('token').then(fn);
  }

}
