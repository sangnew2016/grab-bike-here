import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-google-my-location',
  templateUrl: './google-my-location.component.html',
  styleUrls: ['./google-my-location.component.scss'],
})
export class GoogleMyLocationComponent implements OnInit {

  distance = 0;
  amount = 0;

  constructor(private globalService: GlobalService)
  {
  }

  ngOnInit() {
    // listener
    this.globalService.callback_GetDistanceAndAmount_Emitter.subscribe((distanceAndAmount) => {
      this.distance = distanceAndAmount.distance;
      this.amount = distanceAndAmount.amount;
    });
  }

  whereIam() {
    this.globalService.callback_LoadMap_Emitter.emit();
  }

}
