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
  callback_GetDistanceAndAmount_Emitter = new EventEmitter();

  callback_SetCommandStatus_Emitter = new EventEmitter();

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

      // update value into -> app-google-search/input
      this.callback_GetDestinationPosition_Emitter.emit(destination);

      // calculate distance & amount -> app-google-location/value
      const rad = (x) => x * Math.PI / 180;

      const getDistance = (p1 = {lat: 0, lng: 0}, p2 = {lat: 0, lng: 0}) => {
        const R = 6378137; // Earth’s mean radius in meter
        const dLat = rad(p2.lat - p1.lat);
        const dLong = rad(p2.lng - p1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
                  Math.sin(dLong / 2) * Math.sin(dLong / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return (d / 1000);             // returns the distance in meter (/ 1000 -> km)
      };

      const distance = getDistance(
        {lat: this.bookABike.currentLatitude, lng: this.bookABike.currentLongtitude},
        {lat: this.bookABike.destinationLatitude, lng: this.bookABike.destinationLongtitude}
      );
      const amount = 1.0 * distance * this.bookABike.pricePerKm;

      const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

      this.callback_GetDistanceAndAmount_Emitter.emit({
        distance: formatNumber(distance.toFixed(2)),
        amount: formatNumber(amount.toFixed(0))
      });

      // reset status of button -> app-command
      this.command.status = distance > 0 ? 'enable' : 'disable';

    });

  }

  getToken() {
    return '';
  }

}
