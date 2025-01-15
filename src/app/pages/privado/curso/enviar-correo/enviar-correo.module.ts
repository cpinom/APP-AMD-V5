import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EnviarCorreoPageRoutingModule } from './enviar-correo-routing.module';
import { EnviarCorreoPage } from './enviar-correo.page';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EnviarCorreoPageRoutingModule,
    ComponentsModule,
    AppMaterialModule
  ],
  declarations: [EnviarCorreoPage]
})
export class EnviarCorreoPageModule { }
