import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DistribucionNotasPageRoutingModule } from './distribucion-notas-routing.module';
import { DistribucionNotasPage } from './distribucion-notas.page';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DistribucionNotasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [DistribucionNotasPage]
})
export class DistribucionNotasPageModule { }
