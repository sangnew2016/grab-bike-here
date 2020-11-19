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

  account: any = {
    action: 3,        // 3 = info
    fullName: this.globalService.account.fullName,
    userName: this.globalService.account.username,
    email: this.globalService.account.email,
    phone: this.globalService.account.phone,

    idCard: this.globalService.account.idcard,
    address: this.globalService.account.address,
    avatar: this.globalService.account.avatar
  };

  constructor(private globalService: GlobalService) { }

  ngOnInit() {    
  }

  update() {
    // validate here
    // ...

    this.click_update_event.emit(this.account);
  }

}
