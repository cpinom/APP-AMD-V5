import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActualizarAsistenciaPageRoutingModule } from './actualizar-asistencia-routing.module';
import { ActualizarAsistenciaPage } from './actualizar-asistencia.page';
import { PrincipalPageModule } from './principal/principal.module';
import { ExcepcionPageModule } from './excepcion/excepcion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActualizarAsistenciaPageRoutingModule,
    PrincipalPageModule,
    ExcepcionPageModule
  ],
  declarations: [ActualizarAsistenciaPage]
})
export class ActualizarAsistenciaPageModule { }
