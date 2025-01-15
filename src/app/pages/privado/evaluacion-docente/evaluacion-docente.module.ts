import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EvaluacionDocentePageRoutingModule } from './evaluacion-docente-routing.module';
import { EvaluacionDocentePage } from './evaluacion-docente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EvaluacionDocentePageRoutingModule
  ],
  declarations: [EvaluacionDocentePage]
})
export class EvaluacionDocentePageModule { }
