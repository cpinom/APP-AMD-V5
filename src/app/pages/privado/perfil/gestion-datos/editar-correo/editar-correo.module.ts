import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditarCorreoPageRoutingModule } from './editar-correo-routing.module';
import { EditarCorreoPage } from './editar-correo.page';
import { CodeInputModule } from 'angular-code-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // EditarCorreoPageRoutingModule,
    CodeInputModule
  ],
  declarations: [EditarCorreoPage]
})
export class EditarCorreoPageModule { }
