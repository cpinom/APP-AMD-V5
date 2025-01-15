import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RiesgosAlumnosPageRoutingModule } from './riesgos-alumnos-routing.module';
import { RiesgosAlumnosPage } from './riesgos-alumnos.page';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiesgosAlumnosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RiesgosAlumnosPage]
})
export class RiesgosAlumnosPageModule { }
