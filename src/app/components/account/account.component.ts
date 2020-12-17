import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {

  public accountStatus: number;

  constructor(public globalService: GlobalService) { }

  ngOnInit() {
    // verify account status
    this.accountStatus = this.globalService.account.status;
  }

  click_open_register(emittedValue){
    this.globalService.account.status = 1;            // 1 = register
  }

  /**
   *
   * @param emittedValue
   * {
   *    action: 2,        // 2 = login
   *    fullName: '',
   *    email: '',
   *    phone: '',
   *    password: '',
   *    passwordConfirm: '',
   *    type: 'customer',
   *    idCard: '',
   *    address: '',
   *    avatar: ''
   *  }
   */
  redirect_login(emittedValue) {
    // register data -> server
    this.globalService.data_RegisterAccount_Emitter.emit(emittedValue);
  }

  /**
   *
   * @param emittedValue
   * {
   *    email: '',
   *    password: ''
   * }
   */
  click_login(emittedValue) {
    // get token
    this.globalService.data_LoginToGetToken_Emitter.emit(emittedValue);
  }

  /**
   *
   * @param emittedValue
   * {
   *     fullName: '',
   *     email: '',
   *     phone: '',
   *     idCard: '',
   *     address: '',
   *     avatar: ''
   * }
   */
  click_update(emittedValue) {
    this.globalService.data_UpdateAccount_Emitter.emit(emittedValue);
  }
}
