import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../utils/global.service';
import { UtilsService } from '../utils/utils.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public routeKey: string;
  public accountStatus: number;

  public commandStatus = 'disable';

  constructor(private activatedRoute: ActivatedRoute,
              public globalService: GlobalService,
              private utilsService: UtilsService
              )
  {
  }

  ngOnInit() {
    // format route id
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.folder = this.utilsService.formatRouteId(id);
    this.routeKey = id;

    // format screen with route id
    if (id === 'Account') {
      this.globalService.command.status = 'hide';
    }
    else if (id === 'Book_A_Bike') {
      this.globalService.command.status = 'disable';
      this.globalService.command.text = 'Book';
    }
    else if (id === 'Histories_Customer') {
      this.globalService.command.status = 'hide';
    }
    else if (id === 'Select_A_Customer') {
      this.globalService.command.status = 'hide';
    }
    else if (id === 'Histories_Transport') {
      this.globalService.command.status = 'hide';
    }
    else if (id === 'Customers') {
      this.globalService.command.status = 'hide';
    }
    else if (id === 'Money_And_Fee') {
      this.globalService.command.status = 'hide';
    }
    else {
      this.globalService.command.status = 'hide';
    }

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

  click_whereIam(emittedValue) {
    if (!emittedValue) { return; }

    this.globalService.callback_LoadMap_Emitter.emit('sang thach');
  }

  click_command(emittedValue) {
    alert(emittedValue);
  }

}
