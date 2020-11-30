import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss'],
})
export class CommandComponent implements OnInit {

  @Output()
  // tslint:disable-next-line: variable-name
  click_command_event: EventEmitter<string> = new EventEmitter<string>();

  @Input() name: string;
  @Input() key: string;
  @Input() status: string;

  constructor() { }

  ngOnInit() {}

  click_command() {
    this.click_command_event.emit(this.key);
  }
}
