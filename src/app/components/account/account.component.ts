import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {

  public accountStatus: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit() {
    // verify account status
    this.accountStatus = 2;                 // default: 2 = login
  }

  click_register(emittedValue){
    this.accountStatus = emittedValue;      // 1 = register
  }

  redirect_login(emittedValue) {
    this.accountStatus = emittedValue;      // 2 = login
  }

  click_login(emittedValue){
    this.accountStatus = emittedValue;      // 3 = account info

    // check valid account (after login, if driver -> watchingPosition)
    if (this.globalService.account.type === 'driver') {
      this.globalService.callback_WatchingDrivers_Emitter.emit();
    }
  }

  click_update(emittedValue) {
    // ...
  }
}
