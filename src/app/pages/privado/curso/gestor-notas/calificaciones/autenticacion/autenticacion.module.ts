import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AutenticacionPageRoutingModule } from './autenticacion-routing.module';
import { AutenticacionPage } from './autenticacion.page';
import { CodeInputModule } from 'angular-code-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutenticacionPageRoutingModule,
    CodeInputModule
  ],
  declarations: [AutenticacionPage]
})
export class AutenticacionPageModule { }
