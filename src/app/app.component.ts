import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { GlobalService } from './utils/global.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Account',
      url: '/folder/Account',
      icon: 'mail'
    },
    {
      title: 'Book a bike',
      url: '/folder/Book_A_Bike',
      icon: 'mail'
    },
    {
      title: 'Histories',
      url: '/folder/Histories_Customer',
      icon: 'paper-plane'
    },
    {
      title: 'Select a customer',
      url: '/folder/Select_A_Customer',
      icon: 'heart'
    },
    {
      title: 'Histories',
      url: '/folder/Histories_Transport',
      icon: 'archive'
    },
    {
      title: 'Customers',
      url: '/folder/Customers',
      icon: 'trash'
    },
    {
      title: 'Money & Fee',
      url: '/folder/Money_And_Fee',
      icon: 'warning'
    }
  ];
  public labels = []; //['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private globalService: GlobalService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  logout() {
    // clear global
    this.globalService.cache.clear();
  }
}
