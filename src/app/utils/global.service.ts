import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  // event emitter
  callback_LoadMap_Emitter = new EventEmitter();
  callback_GetPosition_Emitter = new EventEmitter();
  callback_SetCurrentPosition_Emitter = new EventEmitter();

  // object binding
  command: any = {
    text: 'Unknown',
    status: 'hide'
  };

  bookABike: any = {
    currentAddress: '',
    currentLatitude: '',
    currentLongtitude: '',

    destinationAddress: '',
    destinationLatitude: '',
    destinationLongtitude: '',

    distance: 0,
    pricePerKm: 9000,               // need to set by initation
    amount: 0.0
  };

  constructor() {

    this.callback_SetCurrentPosition_Emitter.subscribe((currentPosition) => {
      this.bookABike.currentAddress = currentPosition.address;
      this.bookABike.currentLatitude = currentPosition.latitude;
      this.bookABike.currentLongtitude = currentPosition.longtitude;
    });

  }

  getToken() {
    return '';
  }

}
