import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionPinPageRoutingModule } from './gestion-pin-routing.module';
import { GestionPinPage } from './gestion-pin.page';
import { CodeInputModule } from 'angular-code-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GestionPinPageRoutingModule,
    CodeInputModule
  ],
  declarations: [GestionPinPage]
})
export class GestionPinPageModule { }
