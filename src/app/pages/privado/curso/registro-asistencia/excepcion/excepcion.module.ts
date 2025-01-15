import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExcepcionPageRoutingModule } from './excepcion-routing.module';
import { ExcepcionPage } from './excepcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ExcepcionPageRoutingModule
  ],
  declarations: [ExcepcionPage]
})
export class ExcepcionPageModule {}
