import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';
import { UtilsService } from '../utils/utils.service';
import { LoginComponent } from '../components/login/login.component';
import { AccountInfoComponent } from '../components/account-info/account-info.component';
import { RegisterComponent } from '../components/register/register.component';
import { GlobalService } from '../utils/global.service';
import { GoogleSearchComponent } from '../components/google-search/google-search.component';
import { GoogleMyLocationComponent } from '../components/google-my-location/google-my-location.component';
import { GoogleMapComponent } from '../components/google-map/google-map.component';

@NgModule({
  declarations: [FolderPage, LoginComponent, AccountInfoComponent, RegisterComponent,
    GoogleMapComponent,
    GoogleMyLocationComponent,
    GoogleSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule
  ],
  providers: [UtilsService, GlobalService]
})
export class FolderPageModule {}
