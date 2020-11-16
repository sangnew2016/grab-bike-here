import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { DataService } from 'src/app/utils/data.service';
import { GlobalService } from '../../utils/global.service';

declare var google;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit, OnDestroy {

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;

  address: string; lat: string; long: string;
  currentAddress: string; currentLat: string; currentLong: string;

  // for browers
  GeoCoder: any;

  markers: any[] = [];
  driverMarkers: any[] = [];
  intervalId: any;

  // list of user's location
  bounds: any;
  infoWindow: any;
  currentInfoWindow: any;
  service: any;
  infoPane: any;

  constructor(private geolocation: Geolocation,
              private nativeGeocoder: NativeGeocoder,
              public zone: NgZone,
              private globalService: GlobalService,
              private dataService: DataService)
  {
    // use for browser (should replace by mobile)
    this.GeoCoder = new google.maps.Geocoder();

    // list of user's location
    this.bounds = new google.maps.LatLngBounds();
    this.infoWindow = new google.maps.InfoWindow;
    this.currentInfoWindow = this.infoWindow;
  }

  ngOnInit() {
    this.loadMap();

    // listener
    this.globalService.callback_LoadMap_Emitter.subscribe(() => {
      this.loadMap();
    });

    this.globalService.callback_LoadMapWithPlaceId_Emitter.subscribe((item) => {
      this.loadMapWithPlaceId(item.placeId);
      item.clearAutocomplete();
      item.setDescription(item.description);
    });

    this.globalService.callback_ListOfDriverLocation_Emitter.subscribe(() => {
      // No need setInterval - use SSE (server sent event)
      this.listOfDriverLocation();
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadMap() {
    // FIRST GET THE LOCATION FROM THE DEVICE.
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log('current position: ', resp.coords.latitude, resp.coords.longitude);
      this.currentLat = resp.coords.latitude + '';
      this.currentLong = resp.coords.longitude + '';

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
      // this.map.addListener('tilesloaded', () => {
      //   this.lat = this.map.center.lat();
      //   this.long = this.map.center.lng();

      //   // this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng(), this.globalService);
      //   this.getAddressFromCoordsByBrowser(this.map.center.lat(), this.map.center.lng(), (position) => {
      //     this.globalService.callback_SetDestinationPosition_Emitter.emit(position);
      //   });
      // });

      // SET EVENT 'click, tap'
      this.map.addListener('click', (event) => {
          // tslint:disable-next-line: prefer-for-of
          this.markers.forEach(item => item.setMap(null));
          this.markers = [];

          // Get the location that the user clicked.
          const clickedLocation = event.latLng;
          this.lat = clickedLocation.lat();
          this.long = clickedLocation.lng();

          // Create the marker.
          const markerLabel = 'Your Destination!';

          const markerIcon = {
            url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
            scaledSize: new google.maps.Size(45, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 65),
            labelOrigin:  new google.maps.Point(40, 33),
          };

          this.markers.push(new google.maps.Marker(
            {
              position: clickedLocation,
              animation: google.maps.Animation.BOUNCE,
              map: this.map,
              icon: markerIcon,
              title: 'Destination: HERE',
              draggable: false,
              label: {
                text: markerLabel,
                color: '#eb3a44',
                fontSize: '16px',
                fontWeight: 'bold'
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

  loadMapWithPlaceId(placeId) {
    const request = {
      placeId
    };
    const service = new google.maps.places.PlacesService(this.map);

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const location = place.geometry.location;
          const latLng = new google.maps.LatLng(location.lat(), location.lng());
          const mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        }
      });
  }

  nearByFilter(item)
  {
    const getNearbyPlaces = (position) => {
      const request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: item.keyword

        // radius: '500',            // 500 met
        // type: ['restaurant']
      };

      this.service = new google.maps.places.PlacesService(this.map);
      this.service.nearbySearch(request, nearbyCallback);
    };

    // Handle the results (up to 20) of the Nearby Search
    const nearbyCallback = (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          createMarkers(results);
        }
    };

    const createMarkers = (places) => {
      places.forEach(place => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map: this.map,
          title: place.name
        });

        /* TODO: Step 4B: Add click listeners to the markers */

        // Adjust the map bounds to include the location of this marker
        this.bounds.extend(place.geometry.location);
      });

      /* Once all the markers have been placed, adjust the bounds of the map to
      * show all the markers within the visible area. */
      this.map.fitBounds(this.bounds);
    };

    const currentPosition = new google.maps.LatLng(this.currentLat, this.currentLong);
    this.bounds.extend(currentPosition);
    // this.infoWindow.setPosition(currentPosition);
    // this.infoWindow.setContent('Location found.');
    // this.infoWindow.open(this.map);
    this.map.setCenter(currentPosition);

    /* TODO: Step 3B2, Call the Places Nearby Search */
    getNearbyPlaces.bind(this)(currentPosition);
  }

  listOfDriverLocation() {
    // 0. get locations of driver
    this.dataService.pushTwoway(this.globalService.global.apiUrl + 'position/drivers?username=' + this.globalService.account.username, (item) => {
      // 1. clear old coordinate
      this.driverMarkers.forEach(driverMarker => driverMarker.setMap(null));
      this.driverMarkers = [];

      // 2. show coordinates -> map
      const image = 'https://goo.gl/dqvvFA';
      this.driverMarkers.push(new google.maps.Marker({
        position: { lat: Number(item.latitude), lng: Number(item.longtitude) },
        map: this.map,
        icon: image,
        title: item.userName
      }));

    });
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long );
  }

}
