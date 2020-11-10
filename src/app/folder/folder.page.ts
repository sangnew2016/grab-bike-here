import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../utils/global.service';
import { UtilsService } from '../utils/utils.service';

declare var google;

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public routeKey: string;
  public accountStatus: number;

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

  constructor(private activatedRoute: ActivatedRoute,
              private globalService: GlobalService,
              private utilsService: UtilsService,
              private geolocation: Geolocation,
              private nativeGeocoder: NativeGeocoder,
              public zone: NgZone)
  {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    // format route id
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.folder = this.utilsService.formatRouteId(id);
    this.routeKey = id;

    // verify account status
    this.accountStatus = 2;                 // default: 2 = login

    // load map
    this.loadMap();
  }

  click_register(emittedValue){
    this.accountStatus = emittedValue;      // 1 = register
  }

  redirect_login(emittedValue) {
    this.accountStatus = emittedValue;      // 2 = login
  }

  click_login(emittedValue){
    this.accountStatus = emittedValue;      // 3 = account info
  }

  // LOADING THE MAP HAS 2 PARTS.
  loadMap() {

    // FIRST GET THE LOCATION FROM THE DEVICE.
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // LOAD THE MAP WITH THE PREVIOUS VALUES AS PARAMETERS.
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.map.addListener('tilesloaded', () => {
        console.log('accuracy', this.map, this.map.center.lat());
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());
        this.lat = this.map.center.lat();
        this.long = this.map.center.lng();
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
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0) {
            responseAddress.push(value);
          }
        }
        responseAddress.reverse();
        for (const value of responseAddress) {
          this.address += value + ', ';
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long )
  }

  // AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
        });
      });
    });
  }

  // wE CALL THIS FROM EACH ITEM.
  SelectSearchResult(item) {
    /// WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING
    alert(JSON.stringify(item));
    this.placeid = item.place_id;
  }


  // lET'S BE CLEAN! THIS WILL JUST CLEAN THE LIST WHEN WE CLOSE THE SEARCH BAR.
  ClearAutocomplete(){
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }

  // sIMPLE EXAMPLE TO OPEN AN URL WITH THE PLACEID AS PARAMETER.
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' + this.placeid;
  }
}
