import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  // event emitter
  callback_LoadMap_Emitter = new EventEmitter();
  
  callback_SetDestinationPosition_Emitter = new EventEmitter();
  callback_GetDestinationPosition_Emitter = new EventEmitter();

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

    this.callback_SetDestinationPosition_Emitter.subscribe((destination) => {            
      this.bookABike.destinationAddress = destination.address;
      this.bookABike.destinationLatitude = destination.latitude;
      this.bookABike.destinationLongtitude = destination.longtitude;

      // update value into google-search
      this.callback_GetDestinationPosition_Emitter.emit(destination);
      
      // calculate distance & amount
      // ...
    });

  }

  getToken() {
    return '';
  }

}
