import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetalleCarreraPageRoutingModule } from './detalle-carrera-routing.module';
import { DetalleCarreraPage } from './detalle-carrera.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleCarreraPageRoutingModule
  ],
  declarations: [DetalleCarreraPage]
})
export class DetalleCarreraPageModule { }
