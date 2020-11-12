import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-google-my-location',
  templateUrl: './google-my-location.component.html',
  styleUrls: ['./google-my-location.component.scss'],
})
export class GoogleMyLocationComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_whereIam_event: EventEmitter<number> = new EventEmitter<number>();

  distance = 0;
  amount = 0;

  constructor(private globalService: GlobalService)
  {

  }

  ngOnInit() {
    this.globalService.callback_GetDistanceAndAmount_Emitter.subscribe((distanceAndAmount) => {
      this.distance = distanceAndAmount.distance;
      this.amount = distanceAndAmount.amount;
    });
  }

  // EMIT EVENT OUT
  loadMap() {
    this.click_whereIam_event.emit(1);      // 1 = click    
  }

}
