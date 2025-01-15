import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContactosSedesPageRoutingModule } from './contactos-sedes-routing.module';
import { ContactosSedesPage } from './contactos-sedes.page';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactosSedesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ContactosSedesPage]
})
export class ContactosSedesPageModule { }
