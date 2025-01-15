import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestorNotasPage } from './gestor-notas.page';
import { GestorNotasPageRoutingModule } from './gestor-notas-routing.module';
import { EvaluacionesPageModule } from './evaluaciones/evaluaciones.module';
import { CalificacionesPageModule } from './calificaciones/calificaciones.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestorNotasPageRoutingModule,
    EvaluacionesPageModule,
    CalificacionesPageModule
  ],
  declarations: [GestorNotasPage]
})
export class GestorNotasPageModule { }
