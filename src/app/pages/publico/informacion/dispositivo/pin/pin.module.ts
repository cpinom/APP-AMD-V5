import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PinPageRoutingModule } from './pin-routing.module';
import { PinPage } from './pin.page';
import { FormularioTabletPageModule } from '../formulario-tablet/formulario-tablet.module';
import { ReemplazarTabletPageModule } from '../reemplazar-tablet/reemplazar-tablet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PinPageRoutingModule,
    FormularioTabletPageModule,
    ReemplazarTabletPageModule
  ],
  declarations: [PinPage]
})
export class PinPageModule { }
