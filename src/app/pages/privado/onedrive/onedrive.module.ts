import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OnedrivePageRoutingModule } from './onedrive-routing.module';
import { OnedrivePage } from './onedrive.page';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { DirectivesModule } from 'src/app/core/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnedrivePageRoutingModule,
    PipesModule,
    DirectivesModule
  ],
  declarations: [OnedrivePage]
})
export class OnedrivePageModule { }
