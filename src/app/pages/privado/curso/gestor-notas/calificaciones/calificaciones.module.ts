import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalificacionesPageRoutingModule } from './calificaciones-routing.module';
import { CalificacionesPage } from './calificaciones.page';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask'
import { AutenticacionPageModule } from './autenticacion/autenticacion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CalificacionesPageRoutingModule,
    ComponentsModule,
    NgxMaskDirective,
    AutenticacionPageModule
  ],
  declarations: [CalificacionesPage],
  providers: [provideNgxMask()]
})
export class CalificacionesPageModule { }
