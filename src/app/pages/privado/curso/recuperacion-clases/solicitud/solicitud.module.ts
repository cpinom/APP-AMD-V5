import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitudPage } from './solicitud.page';
import { BuscadorPageModule } from './buscador/buscador.module';
import { DisponibilidadPageModule } from './disponibilidad/disponibilidad.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuscadorPageModule,
    DisponibilidadPageModule
  ],
  declarations: [SolicitudPage]
})
export class SolicitudPageModule { }
