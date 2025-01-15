import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DescriptorAsignaturaPageRoutingModule } from './descriptor-asignatura-routing.module';
import { DescriptorAsignaturaPage } from './descriptor-asignatura.page';
import { PipesModule } from 'src/app/core/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DescriptorAsignaturaPageRoutingModule,
    PipesModule
  ],
  declarations: [DescriptorAsignaturaPage]
})
export class DescriptorAsignaturaPageModule { }
