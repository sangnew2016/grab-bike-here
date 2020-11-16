import { EventEmitter, Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  // 0. global variable
  global: any = {
    apiUrl: 'https://localhost:44336/api/'
  };

  // 1. event emitter
  callback_LoadMap_Emitter = new EventEmitter();
  callback_LoadMapWithPlaceId_Emitter = new EventEmitter();

  callback_ListOfDriverLocation_Emitter = new EventEmitter();
  callback_ListOfUserLocation_Emitter = new EventEmitter();
  callback_WatchingDrivers_Emitter = new EventEmitter();

  callback_SetDestinationPosition_Emitter = new EventEmitter();
  callback_GetDestinationPosition_Emitter = new EventEmitter();

  callback_SetCurrentPosition_Emitter = new EventEmitter();
  callback_GetDistanceAndAmount_Emitter = new EventEmitter();

  callback_SetCommandStatus_Emitter = new EventEmitter();

  callback_PushCurrentLocation_Emitter = new EventEmitter();


  // 2. object binding
  command: any = {
    text: 'Unknown',
    status: 'hide'
  };

  account: any = {
    userid: '000111',
    username: 'sangthach',
    email: 'sang@gmail.com',
    phone: '0923456543',
    type: 'driver'            // driver, customer, admin
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

  constructor(private dataService: DataService) {

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

    this.callback_PushCurrentLocation_Emitter.subscribe((position) => {
      // put by api (one by one)
      this.dataService.put(this.global.apiUrl + 'position', position);
    });

    this.callback_WatchingDrivers_Emitter.subscribe(() => {
      this.dataService.pushWatching('demo_sse.php');
    });

  }


  // 3. Common function
  getToken() {
    return '';
  }

  setCommandText(routeId) {
    // format screen with route id
    if (routeId === 'Account') {
      this.command.status = 'hide';
    }
    else if (routeId === 'Book_A_Bike') {
      this.command.status = 'disable';
      this.command.text = 'Book';
    }
    else if (routeId === 'Histories_Customer') {
      this.command.status = 'hide';
    }
    else if (routeId === 'Select_A_Customer') {
      this.command.status = 'hide';
    }
    else if (routeId === 'Histories_Transport') {
      this.command.status = 'hide';
    }
    else if (routeId === 'Customers') {
      this.command.status = 'hide';
    }
    else if (routeId === 'Money_And_Fee') {
      this.command.status = 'hide';
    }
    else {
      this.command.status = 'hide';
    }
  }

}
