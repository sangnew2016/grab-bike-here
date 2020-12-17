import { EventEmitter, Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  // 0. global variable
  global: any = {
    apiUrl: 'https://localhost:44336/api/',
    circleRadius: 2000                                  // 2 km = 2000 m
  };

  // 1. event emitter
  callback_LoadMap_Emitter = new EventEmitter();
  callback_LoadMapWithPlaceId_Emitter = new EventEmitter();

  callback_ListOfDriverLocation_Emitter = new EventEmitter();  
  callback_DisplayRouteFromTo_Emitter = new EventEmitter();

  callback_SetDestinationPosition_Emitter = new EventEmitter();
  callback_GetDestinationPosition_Emitter = new EventEmitter();

  callback_SetCurrentPosition_Emitter = new EventEmitter();
  callback_GetDistanceAndAmount_Emitter = new EventEmitter();

  callback_SetCommandStatus_Emitter = new EventEmitter();

  callback_PushCurrentLocation_Emitter = new EventEmitter();
  callback_PushCurrentLocations_Emitter = new EventEmitter();           // monitor position

  data_RegisterAccount_Emitter = new EventEmitter();
  data_LoginToGetToken_Emitter = new EventEmitter();
  data_UpdateAccount_Emitter = new EventEmitter();

  data_InsertBooking_Emitter = new EventEmitter();


  // 2. object binding
  command: any = {
    text: 'Unknown',
    status: 'hide'            // hide, enable, disable
  };

  account: any = {
    userid: '',
    password: '',
    passwordConfirm: '',

    fullName: '',
    email: '',
    phone: '',
    idCard: '',
    address: '',
    avatar: '',

    status: 2,                // 1: register, 2: login (default), 3: account info
    type: ''                  // driver, customer, admin
  };

  bookABike: any = {
    userBookId: '',
    fullNameDelegate: '',
    phoneDelegate: '',

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

  constructor(private storage: Storage, private dataService: DataService) {

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

      // update value into tree
      this.bookABike.distance = distance;
      this.bookABike.amount = amount;

      // reset status of button -> app-command
      this.command.status = distance > 0 ? 'enable' : 'disable';

    });

    this.callback_PushCurrentLocation_Emitter.subscribe((position) => {
      // put by api (one by one)
      this.dataService.put(this.global.apiUrl + 'position', position);
    });

    this.callback_PushCurrentLocations_Emitter.subscribe(() => {
      this.dataService.pushWatching(this.global.apiUrl + 'position', {
        email: this.account.email,
        userType: this.account.type,
        latitude: '',
        longtitude: ''
      });
    });

    this.data_RegisterAccount_Emitter.subscribe((account) => {
      this.dataService.post(this.global.apiUrl + 'account/register', account, (rowAffected) => {
        console.log(rowAffected ? 'Your account has been created.' : 'Error: check server api log for register');
        if (rowAffected) {
          // clear password - confirm password
          this.account.password = '';
          this.account.passwordConfirm = '';

          this.account.status = 2;      // 2 = login
        }
      });
    });

    this.data_LoginToGetToken_Emitter.subscribe((login) => {
      this.dataService.post(this.global.apiUrl + 'account/login', login, (result) => {
        if (result && result.token) {
          // keep into device
          this.storage.set('token', 'Bearer ' + result.token);
          this.account.status = 3;      // 3 = account info

          this.account.userid = result.id;
          this.account.fullName = result.fullName;
          this.account.email = result.email;
          this.account.phone = result.phone;
          this.account.idCard = result.idCard;
          this.account.address = result.address;
          this.account.avatar = result.avatar;
          this.account.type = result.type;

          this.updateCurrentPosition();                               // update current position into global variable

          if (this.account.type === 'driver') {
            this.callback_PushCurrentLocations_Emitter.emit();        // push position to server
          }
        }
      });
    });

    this.data_UpdateAccount_Emitter.subscribe((account) => {
      this.dataService.putAuth(this.global.apiUrl + 'account/update', account, (result) => {
        if (result) {
          console.log('Your account has been updated.');
        }
      });
    });

    this.data_InsertBooking_Emitter.subscribe(() => {
      this.bookABike.userBookId = this.account.userid;
      this.bookABike.fullNameDelegate = this.account.fullName;      // will change for part 2
      this.bookABike.phoneDelegate = this.account.phone;            // will change for part 2

      const book = JSON.parse(JSON.stringify(this.bookABike));
      const x: any = {};
      x.currentAddress = book.currentAddress + '';
      x.currentLatitude = book.currentLatitude + '';
      x.currentLongtitude = book.currentLongtitude + '';

      x.destinationAddress = book.destinationAddress + '';
      x.destinationLatitude = book.destinationLatitude + '';
      x.destinationLongtitude = book.destinationLongtitude + '';

      x.distance = book.distance.toFixed(2) + '';
      x.amount = book.amount.toFixed(0) + '';
      x.pricePerKm = book.pricePerKm + '';

      x.fullNameDelegate = book.fullNameDelegate + '';
      x.phoneDelegate = book.phoneDelegate + '';
      x.userBookId = book.userBookId + '';

      this.dataService.postAuth(this.global.apiUrl + 'customer/bookabike', x, (result) => {
        // toast up message
        console.log('Success,', 'bookId: ', result.bookId);
      });
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

  updateCurrentPosition() {
    const looping = interval(10 * 1000);    // 10s
    looping.subscribe(() => {
      // update position into global variable
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.bookABike.currentLatitude = position.coords.latitude;
          this.bookABike.currentLongtitude = position.coords.longitude;
        });
      } else {
        console.log('Detect - updateCurrentPosition: Geolocation is not supported by this browser.');
      }
    });
  }

}
