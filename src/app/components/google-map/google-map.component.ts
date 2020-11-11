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
    // load map
    this.loadMap();

    this.globalService.callbackLoadMapEmitter.subscribe((value) => {
      this.loadMap();
    });
  }

  // only run on browers
  codeLatLng(lat, lng, service) {
    const latlng = new google.maps.LatLng(lat, lng);
    this.GeoCoder.geocode({
        latLng: latlng
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            console.log(results[1]);
            service.callbackGetAddressEmitter.emit(results[1].formatted_address);
          } else {
            alert('No results found');
          }
        } else {
          alert('Geocoder failed due to: ' + status);
        }
    });
  }

  // LOADING THE MAP HAS 2 PARTS.
  loadMap() {

    // FIRST GET THE LOCATION FROM THE DEVICE.
    this.geolocation.getCurrentPosition().then((resp) => {
      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      const mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // LOAD THE MAP WITH THE PREVIOUS VALUES AS PARAMETERS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.map.addListener('tilesloaded', () => {
        console.log('accuracy', this.map, this.map.center.lat());

        // only for native device
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());

        this.lat = this.map.center.lat();
        this.long = this.map.center.lng();
      });

      this.map.addListener('click', (event) => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
          }
          this.markers = [];

          // Get the location that the user clicked.
          let clickedLocation = event.latLng;

          // Create the marker.
          let marker = new google.maps.Marker({
            position: clickedLocation,
            map: this.map,
            //icon: Image,
            title: 'Destination: HERE',
            draggable: false,
            label: {
              text: 'Destination: HERE',
              color: '#222222',
              fontSize: '12px'
            }
          });


          this.markers.push(marker);

          console.log(marker);
          this.codeLatLng(clickedLocation.lat(), clickedLocation.lng(), this.globalService);
      });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }


  getAddressFromCoords(lattitude, longitude) {
    console.log('getAddressFromCoords ' + lattitude + ' ' + longitude);
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
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

        // send address to
        this.globalService.callbackGetAddressEmitter.emit(this.address);
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long );
  }

}
