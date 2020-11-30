import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_update_event: EventEmitter<object> = new EventEmitter<object>();

  constructor(public globalService: GlobalService) { }

  ngOnInit() {
  }

  update() {
    // validate here
    // ...

    this.click_update_event.emit(this.globalService.account);
  }

}
