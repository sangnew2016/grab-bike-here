import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {

  public accountStatus: number;

  constructor() { }

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
  }

  click_update(emittedValue) {
    // ...
  }
}
