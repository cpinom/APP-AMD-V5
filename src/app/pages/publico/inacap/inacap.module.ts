import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InacapPageRoutingModule } from './inacap-routing.module';
import { InacapPage } from './inacap.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InacapPageRoutingModule
  ],
  declarations: [InacapPage]
})
export class InacapPageModule { }
