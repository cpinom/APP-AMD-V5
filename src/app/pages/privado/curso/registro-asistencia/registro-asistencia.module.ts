import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistroAsistenciaPageRoutingModule } from './registro-asistencia-routing.module';
import { RegistroAsistenciaPage } from './registro-asistencia.page';
import { RouterModule } from '@angular/router';
import { ExcepcionPageModule } from './excepcion/excepcion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroAsistenciaPageRoutingModule,
    ExcepcionPageModule
  ],
  declarations: [RegistroAsistenciaPage],
  exports: [RouterModule]
})
export class RegistroAsistenciaPageModule {}
