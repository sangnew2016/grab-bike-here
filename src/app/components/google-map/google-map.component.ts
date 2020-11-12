import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { GlobalService } from '../../utils/global.service';

declare var google;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address: string;
  lat: string;
  long: string;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;

  GeoCoder: any;    // for browers
  markers: any[] = [];

  constructor(private geolocation: Geolocation,
              private nativeGeocoder: NativeGeocoder,
              public zone: NgZone,
              private globalService: GlobalService)
  {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];

    this.GeoCoder = new google.maps.Geocoder();
  }

  ngOnInit() {
    this.loadMap();

    // listener
    this.globalService.callback_LoadMap_Emitter.subscribe(() => {
      this.loadMap();
    });
  }

  loadMap() {
    // FIRST GET THE LOCATION FROM THE DEVICE.
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log('current position: ', resp.coords.latitude, resp.coords.longitude);

      // GET ADDRESS
      // this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude, this.globalService);
      this.getAddressFromCoordsByBrowser(resp.coords.latitude, resp.coords.longitude, (position) => {
        this.globalService.callback_SetCurrentPosition_Emitter.emit(position);
      });

      // LOAD THE MAP WITH THE PREVIOUS VALUES AS PARAMETERS.
      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // SET EVENT 'tilesloaded'
      this.map.addListener('tilesloaded', () => {
        this.lat = this.map.center.lat();
        this.long = this.map.center.lng();

        // this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng(), this.globalService);
        this.getAddressFromCoordsByBrowser(this.map.center.lat(), this.map.center.lng(), (position) => {
          this.globalService.callback_SetDestinationPosition_Emitter.emit(position);
        });
      });

      // SET EVENT 'click, tap'
      this.map.addListener('click', (event) => {
          // tslint:disable-next-line: prefer-for-of
          this.markers.forEach(item => item.setMap(null));
          this.markers = [];

          // Get the location that the user clicked.
          const clickedLocation = event.latLng;

          // Create the marker.
          this.markers.push(new google.maps.Marker(
            {
              position: clickedLocation,
              map: this.map,
              // icon: Image,
              title: 'Destination: HERE',
              draggable: false,
              label: {
                text: 'Destination: HERE',
                color: '#222222',
                fontSize: '12px'
              }
            }
          ));

          // this.getAddressFromCoords(clickedLocation.lat(), clickedLocation.lng(), this.globalService);
          this.getAddressFromCoordsByBrowser(clickedLocation.lat(), clickedLocation.lng(), (position) => {
            this.globalService.callback_SetDestinationPosition_Emitter.emit(position);
          });
      });

    }).catch((error) => {
      console.log('Error at loadMap - getCurrentPosition: ', error);
    });
  }


  getAddressFromCoords(lattitude, longitude, callback) {
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options).then(
      (result: NativeGeocoderResult[]) => {
        this.address = '';

        const responseAddress = [];
        for (const [key, value] of Object.entries(result[0])) {
          if (value.length > 0) {
            responseAddress.push(value);
          }
        }

        responseAddress.reverse();
        for (const value of responseAddress) {
          this.address += value + ', ';
        }

        this.address = this.address.slice(0, -2);
        callback({
          address: this.address,
          latitude: lattitude,
          longtitude: longitude
        });
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });
  }

  // only run on browers
  getAddressFromCoordsByBrowser(latitude, longtitude, callback) {
    const latlng = new google.maps.LatLng(latitude, longtitude);
    this.GeoCoder.geocode({ latLng: latlng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const address = results[1];
        if (address) {
          console.log('Get address by coord: ', address);

          callback({
            address: address.formatted_address,
            latitude,
            longtitude
          });
        } else {
          console.log('Error at getAddressFromCoordsByBrowser: ', 'No results found by get Address by Coords');
        }
      } else {
        console.log('Error at getAddressFromCoordsByBrowser: ', status);
      }
    });
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long );
  }

}
