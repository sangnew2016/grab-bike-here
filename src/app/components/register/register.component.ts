import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalService } from 'src/app/utils/global.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_register_event: EventEmitter<any> = new EventEmitter<any>();

  account: any = {
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    type: 'customer',
    idCard: '',
    address: '',
    avatar: ''
  };

  constructor(private globalService: GlobalService) { }

  ngOnInit() {}

  register() {
    // validate here
    // ...

    // sync -> globalService
    this.globalService.account.userName = this.account.userName;
    this.globalService.account.fullName = this.account.fullName;
    this.globalService.account.email = this.account.email;
    this.globalService.account.phone = this.account.phone;
    this.globalService.account.idCard = this.account.idCard;
    this.globalService.account.address = this.account.address;
    this.globalService.account.avatar = this.account.avatar;
    this.globalService.account.type = this.account.type;

    this.click_register_event.emit(this.account);
  }

}
