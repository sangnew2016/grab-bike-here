import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_open_register_event: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  // tslint:disable-next-line: variable-name
  click_login_event: EventEmitter<number> = new EventEmitter<number>();

  account: any = {
    username: '',
    password: ''
  };

  constructor() { }

  ngOnInit() {}

  click_open_register() {
    this.click_open_register_event.emit(1);      //1 == register
  }

  login() {
    // verify account in database and get token
    // ...
    this.click_login_event.emit(this.account);         //3 == account info
  }
}
