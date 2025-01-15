import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComunicacionesPageRoutingModule } from './comunicaciones-routing.module';
import { ComunicacionesPage } from './comunicaciones.page';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComunicacionesPageRoutingModule,
    AppMaterialModule
  ],
  declarations: [ComunicacionesPage]
})
export class ComunicacionesPageModule { }
