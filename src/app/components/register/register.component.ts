import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_register_event: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {}

  click_register() {
    this.click_register_event.emit(2);      //2 = login
  }

}
