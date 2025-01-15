import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MensajeComponent } from './mensaje.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  declarations: [
    MensajeComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    PipesModule
  ]
})
export class MensajeModule { }
