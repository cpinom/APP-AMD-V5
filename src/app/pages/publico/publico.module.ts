import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PublicoPageRoutingModule } from './publico-routing.module';
import { PublicoPage } from './publico.page';
import { InformacionPageModule } from './informacion/informacion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicoPageRoutingModule,
    InformacionPageModule
  ],
  declarations: [PublicoPage]
})
export class PublicoPageModule { }
