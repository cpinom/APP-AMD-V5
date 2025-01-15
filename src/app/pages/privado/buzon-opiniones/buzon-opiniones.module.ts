import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BuzonOpinionesPageRoutingModule } from './buzon-opiniones-routing.module';
import { BuzonOpinionesPage } from './buzon-opiniones.page';
import { DetalleOpinionPageModule } from './detalle-opinion/detalle-opinion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BuzonOpinionesPageRoutingModule,
    DetalleOpinionPageModule
  ],
  declarations: [BuzonOpinionesPage]
})
export class BuzonOpinionesPageModule { }
