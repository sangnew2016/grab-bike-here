import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_register_event: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  // tslint:disable-next-line: variable-name
  click_login_event: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {}

  click_register() {
    this.click_register_event.emit(1);      //1 == register
  }

  click_login() {
    // verify account in database and get token
    // ...
    this.click_login_event.emit(3);         //3 == account info
  }
}
