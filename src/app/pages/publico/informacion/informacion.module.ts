import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InformacionPage } from './informacion.page';
import { PrincipalPageModule } from './principal/principal.module';
import { DispositivoPageModule } from './dispositivo/dispositivo.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrincipalPageModule,
    DispositivoPageModule
  ],
  declarations: [InformacionPage]
})
export class InformacionPageModule { }
