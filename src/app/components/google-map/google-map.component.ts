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
  userMarkers: any[] = [];
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
    this.infoWindow = new google.maps.InfoWindow();
    this.currentInfoWindow = this.infoWindow;
  }

  ngOnInit() {
    this.loadMap();

    if (this.globalService.account.type === 'driver') {
      this.listOfUserLocation();
    }

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
    setTimeout(() => {
      const latitude = this.globalService.bookABike.currentLatitude;
      const longtitude = this.globalService.bookABike.currentLongtitude;

      console.log('current position: ', latitude, longtitude);
      this.currentLat = latitude + '';
      this.currentLong = longtitude + '';

      // GET ADDRESS
      // this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude, this.globalService);
      this.getAddressFromCoordsByBrowser(latitude, longtitude, (position) => {
        this.globalService.callback_SetCurrentPosition_Emitter.emit(position);
      });

      // LOAD THE MAP WITH THE PREVIOUS VALUES AS PARAMETERS.
      const latLng = new google.maps.LatLng(latitude, longtitude);
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

    }, 0);
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

        this.markers = this.setMarker(this.markers, 'Your Destination', latAndLong);
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
    const looping = interval(this.globalService.global.timeLoop * 1000);    // 10s
    looping.subscribe(() => {
      this.dataService.get(this.globalService.global.apiUrl +
        'position/drivers?email=' + this.globalService.account.email, (positions) => {

        positions.forEach((item) => {
          // skip duplicate position
          const isDuplicated = this.driverMarkers.some((marker) => {
            return marker.position.lat() === Number(item.latitude) && marker.position.lng() === Number(item.longtitude);
          });
          const hasMyDriver = isMyDriver(item);

          if (!hasMyDriver && isDuplicated) { return; }

          // set marker into Map
          const latAndLong = new google.maps.LatLng(Number(item.latitude), Number(item.longtitude));
          this.driverMarkers = this.setMarker(
            this.driverMarkers,
            (hasMyDriver ? 'My Driver: ' : 'Driver: ') + item.email,
            latAndLong,
            null,
            true,
            google.maps.Animation.BOUNCE,
            'https://s3.amazonaws.com/my.common/giphy_maps.gif'
          );
        });

      });
    });

    const isMyDriver = (positionFromServer) => {
      if (!positionFromServer.combineEmail) { return false; }

      const m = positionFromServer.combineEmail.split('___');
      const emailUser = m[0];
      return this.globalService.account.email === emailUser;
    };
  }

  listOfUserLocation() {
    // 0. circular
    setTimeout(() => {
      this.createCircle(
        this.globalService.bookABike.currentLatitude,
        this.globalService.bookABike.currentLongtitude,
        this.globalService.global.circleRadius
      );
    }, 0);

    // 1. get locations of users
    const looping = interval(this.globalService.global.timeLoop * 1000);    // 10s
    looping.subscribe(() => {
      this.dataService.get(this.globalService.global.apiUrl +
        'position/users?email=' + this.globalService.account.email
        + '&radius=' + this.globalService.global.circleRadius, (positions) => {

        // 2. set markers
        positions.forEach((item) => {
          // skip duplicate position
          const isDuplicated = this.userMarkers.some((marker) => {
            return marker.position.lat() === Number(item.latitude) && marker.position.lng() === Number(item.longtitude);
          });
          if (isDuplicated) { return; }

          // set marker into Map
          const latAndLong = new google.maps.LatLng(Number(item.latitude), Number(item.longtitude));
          this.userMarkers = this.setMarker(
            this.userMarkers,
            'Id: ' + item.email,
            latAndLong,
            ((pos) => {
              console.log('Detect - clickMarker: ', pos);
              pos.driverTaken = this.globalService.account.userid + '';

              this.globalService.data_GetABook_Emitter.emit(pos);
            }).bind(this, item),
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
            clickOnMarkerCallback = null,
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

    if (clickOnMarkerCallback) {
      google.maps.event.addListener(marker, 'click', () => {
        clickOnMarkerCallback();
      });
    }

    markers.push(marker);

    return markers;
  }

  // FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' + this.lat + ', long' + this.long );
  }

  // private (for driver) - draw circle
  createCircle(lat, lng, radius) {
    const circle = new google.maps.Circle({
      strokeColor: '#888', // Mau vien
      strokeOpacity: 0.5, // Do mo vien
      strokeWeight: 1, // Do manh cua duong tron
      fillColor: '#03A9F4', // Mau nen cua duong tron
      fillOpacity: 0.1, // Do trong suot
      map: this.map, // map
      center: {lat, lng}, // toa do trung tam
      radius // ban kinh
    });
  }

}
