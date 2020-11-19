import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { interval } from 'rxjs';
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

    this.globalService.callback_DisplayRouteFromTo_Emitter.subscribe(() => {
      this.displayRouteFromTo('DRIVING');
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
          // Get the location that the user clicked.
          const clickedLocation = event.latLng;
          this.lat = clickedLocation.lat();
          this.long = clickedLocation.lng();          

          // Create the marker.
          this.markers = this.setMarker(this.markers, 'Your Destination', clickedLocation);

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
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( {placeId}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const latAndLong = new google.maps.LatLng(
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng()
        );

        this.map.setCenter(latAndLong);

        this.setMarker(this.markers, 'Your Destination', latAndLong);
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
    const looping = interval(30 * 1000);    // 30s
    looping.subscribe(() => {
      this.dataService.get(this.globalService.global.apiUrl + 
        'position/drivers?email=' + this.globalService.account.email, (positions) => {

        positions.forEach((item) => {
          const latAndLong = new google.maps.LatLng(Number(item.latitude), Number(item.longtitude));
          this.setMarker(
            this.driverMarkers,
            this.globalService.account.email,
            latAndLong,            
            true,
            google.maps.Animation.BOUNCE,
            'https://s3.amazonaws.com/my.common/giphy_maps.gif'
          );
        });

      });
    });

  }

  // private function
  displayRouteFromTo(mode) {
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({ map: this.map });

    directionsService.route({
        origin: new google.maps.LatLng(
          this.globalService.bookABike.currentLatitude,
          this.globalService.bookABike.currentLongtitude
        ),
        destination: new google.maps.LatLng(
          this.globalService.bookABike.destinationLatitude,
          this.globalService.bookABike.destinationLongtitude
        ),
        travelMode: mode,                                        // [DRIVING, WALKING, BICYCLING, TRANSIT]
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        } else {
          console.log('Error at callback_DisplayRouteFromTo_Emitter: ', 'Request for getting direction is failed due to ' + status);
        }
    });
  }


  // private function
  setMarker(markers, title, latAndLong,
            isClearAllBeforeSet = true,
            animation = google.maps.Animation.BOUNCE,
            imageUrl = 'http://image.flaticon.com/icons/svg/252/252025.svg') {

    if (isClearAllBeforeSet) {
      // tslint:disable-next-line: prefer-for-of
      markers.forEach(item => item.setMap(null));
      markers = [];
    }

    const markerLabel = title;

    const markerIcon = {
      url: imageUrl,
      scaledSize: new google.maps.Size(45, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 43),
      labelOrigin:  new google.maps.Point(20, 43),
    };

    const marker = new google.maps.Marker(
      {
        position: latAndLong,
        animation,      // BOUNCE, DROP
        map: this.map,
        icon: markerIcon,
        title,
        draggable: false,
        label: {
          text: markerLabel,
          color: '#eb3a44',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }
    );

    markers.push(marker);

    return markers;
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long );
  }

}
