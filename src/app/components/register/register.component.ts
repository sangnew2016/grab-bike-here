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

  constructor(public globalService: GlobalService) { }

  ngOnInit() {
    this.globalService.account.type = 'customer';
  }

  register() {
    // validate here
    // ...
    
    this.click_register_event.emit(this.globalService.account);
  }

}
