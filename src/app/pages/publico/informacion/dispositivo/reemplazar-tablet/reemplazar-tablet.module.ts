import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReemplazarTabletPageRoutingModule } from './reemplazar-tablet-routing.module';
import { ReemplazarTabletPage } from './reemplazar-tablet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReemplazarTabletPageRoutingModule
  ],
  declarations: [ReemplazarTabletPage]
})
export class ReemplazarTabletPageModule { }
