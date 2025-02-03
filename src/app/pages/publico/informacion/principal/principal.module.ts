import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PrincipalPage } from './principal.page';
import { PinPageModule } from '../dispositivo/pin/pin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PinPageModule
  ],
  declarations: [PrincipalPage]
})
export class PrincipalPageModule { }
