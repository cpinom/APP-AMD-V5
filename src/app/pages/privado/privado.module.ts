import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PrivadoPageRoutingModule } from './privado-routing.module';
import { PrivadoPage } from './privado.page';
import { NotificacionesPageModule } from './notificaciones/notificaciones.module';
import { PerfilPageModule } from './perfil/perfil.module';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PrivadoPageRoutingModule,
    NotificacionesPageModule,
    PerfilPageModule,
    AppMaterialModule
  ],
  declarations: [PrivadoPage]
})
export class PrivadoPageModule { }
