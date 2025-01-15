import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OportunidadesAlumnosPageRoutingModule } from './oportunidades-alumnos-routing.module';
import { OportunidadesAlumnosPage } from './oportunidades-alumnos.page';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OportunidadesAlumnosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [OportunidadesAlumnosPage]
})
export class OportunidadesAlumnosPageModule { }
