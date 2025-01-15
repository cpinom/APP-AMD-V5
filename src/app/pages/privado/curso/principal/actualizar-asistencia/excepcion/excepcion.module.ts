import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExcepcionPage } from './excepcion.page';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // MaterialModule
  ],
  declarations: [ExcepcionPage]
})
export class ExcepcionPageModule { }
