import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-google-my-location',
  templateUrl: './google-my-location.component.html',
  styleUrls: ['./google-my-location.component.scss'],
})
export class GoogleMyLocationComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_whereIam_event: EventEmitter<number> = new EventEmitter<number>();

  constructor()
  {

  }

  ngOnInit() {}

  // EMIT EVENT OUT
  loadMap() {
    this.click_whereIam_event.emit(1);      // 1 = click    
  }

}
