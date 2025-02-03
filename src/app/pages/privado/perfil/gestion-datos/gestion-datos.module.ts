import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionDatosPage } from './gestion-datos.page';
import { EditarCorreoPageModule } from './editar-correo/editar-correo.module';
import { EditarTelefonoPageModule } from './editar-telefono/editar-telefono.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarCorreoPageModule,
    EditarTelefonoPageModule
  ],
  declarations: [GestionDatosPage]
})
export class GestionDatosPageModule { }
