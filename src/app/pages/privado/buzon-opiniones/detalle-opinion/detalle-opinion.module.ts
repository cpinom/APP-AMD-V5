import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetalleOpinionPageRoutingModule } from './detalle-opinion-routing.module';
import { DetalleOpinionPage } from './detalle-opinion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleOpinionPageRoutingModule
  ],
  declarations: [DetalleOpinionPage]
})
export class DetalleOpinionPageModule { }
