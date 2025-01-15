import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TiposAlumnosPageRoutingModule } from './tipos-alumnos-routing.module';
import { TiposAlumnosPage } from './tipos-alumnos.page';
import { ComponentsModule } from 'src/app/core/components/components.module';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiposAlumnosPageRoutingModule,
    ComponentsModule,
    MatSortModule
  ],
  declarations: [TiposAlumnosPage]
})
export class TiposAlumnosPageModule { }
