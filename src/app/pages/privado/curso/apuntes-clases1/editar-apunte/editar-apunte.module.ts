import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditarApuntePageRoutingModule } from './editar-apunte-routing.module';
import { EditarApuntePage } from './editar-apunte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // EditarApuntePageRoutingModule
  ],
  declarations: [EditarApuntePage]
})
export class EditarApuntePageModule { }
