import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilAlumnosPageRoutingModule } from './perfil-alumnos-routing.module';
import { PerfilAlumnosPage } from './perfil-alumnos.page';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilAlumnosPageRoutingModule,
    ComponentsModule,
    MatSortModule
  ],
  declarations: [PerfilAlumnosPage]
})
export class PerfilAlumnosPageModule { }
