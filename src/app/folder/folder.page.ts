import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../utils/global.service';
import { UtilsService } from '../utils/utils.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public routeKey: string;

  public commandStatus = 'disable';

  constructor(private activatedRoute: ActivatedRoute,
              public globalService: GlobalService,
              private utilsService: UtilsService
              )
  {
  }

  ngOnInit() {
    // format route id
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.folder = this.utilsService.formatRouteId(id);
    this.routeKey = id;

    this.globalService.setCommandText(id);

  }

  click_command(emittedValue) {
    if (emittedValue === 'Book_A_Bike') {
      // Push user position -> server
      this.globalService.callback_PushCurrentLocation_Emitter.emit({
        userName: this.globalService.account.username + '',
        userType: this.globalService.account.type + '',
        latitude: this.globalService.bookABike.currentLatitude + '',
        longtitude: this.globalService.bookABike.currentLongtitude + ''
      });

      // Get all locations of all of Driver
      this.globalService.callback_ListOfDriverLocation_Emitter.emit();
    }
  }


}
