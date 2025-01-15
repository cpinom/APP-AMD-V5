import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AprendizajesEsperadosPageRoutingModule } from './aprendizajes-esperados-routing.module';
import { AprendizajesEsperadosPage } from './aprendizajes-esperados.page';
import { FiltrosPageModule } from './filtros/filtros.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprendizajesEsperadosPageRoutingModule,
    FiltrosPageModule
  ],
  declarations: [AprendizajesEsperadosPage]
})
export class AprendizajesEsperadosPageModule { }
