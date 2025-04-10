import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AsistenciaClasesPageRoutingModule } from './asistencia-clases-routing.module';
import { AsistenciaClasesPage } from './asistencia-clases.page';
import { DirectivesModule } from 'src/app/core/directives/directives.module';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsistenciaClasesPageRoutingModule,
    DirectivesModule,
    ComponentsModule,
    AppMaterialModule
  ],
  declarations: [AsistenciaClasesPage]
})
export class AsistenciaClasesPageModule { }
