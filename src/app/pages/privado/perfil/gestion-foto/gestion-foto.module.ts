import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GestionFotoPage } from './gestion-foto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // GestionFotoPageRoutingModule
  ],
  declarations: [GestionFotoPage]
})
export class GestionFotoPageModule { }
