import { Component, OnInit, NgZone } from '@angular/core';
import { GlobalService } from '../../utils/global.service';

declare var google;

@Component({
  selector: 'app-google-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.scss'],
})
export class GoogleSearchComponent implements OnInit {

  autocomplete: { input: string; };
  autocompleteItems: any[];
  placeid: any;
  GoogleAutocomplete: any;

  constructor(
    public zone: NgZone,
    public globalService: GlobalService
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    // listener
    this.globalService.callback_GetDestinationPosition_Emitter.subscribe((destination) => {
      this.autocomplete.input = destination.address;
    });

  }

  // AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
    if (this.autocomplete.input === '') {
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
    console.log('Item selected on autocomplete: ', JSON.stringify(item));
    this.placeid = item.place_id;
    this.globalService.callback_LoadMapWithPlaceId_Emitter.emit({
      placeId: item.place_id,
      description: item.description,
      setDescription: ((value) => this.autocomplete.input = value).bind(this),
      clearAutocomplete: this.ClearAutocomplete.bind(this)       // avoid publish back
    });
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
