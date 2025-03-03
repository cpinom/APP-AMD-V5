import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPage } from './perfil.page';
import { PrincipalPageModule } from './principal/principal.module';
import { GestionPinPageModule } from './gestion-pin/gestion-pin.module';
import { GestionDatosPageModule } from './gestion-datos/gestion-datos.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrincipalPageModule,
    GestionPinPageModule,
    GestionDatosPageModule
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule { }
