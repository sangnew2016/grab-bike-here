import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_update_event: EventEmitter<object> = new EventEmitter<object>();

  constructor() { }

  ngOnInit() {

  }

  click_update() {
    this.click_update_event.emit({});
  }

}
