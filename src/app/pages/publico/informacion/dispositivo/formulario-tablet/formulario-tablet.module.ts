import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormularioTabletPageRoutingModule } from './formulario-tablet-routing.module';
import { FormularioTabletPage } from './formulario-tablet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FormularioTabletPageRoutingModule
  ],
  declarations: [FormularioTabletPage]
})
export class FormularioTabletPageModule { }
