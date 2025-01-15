import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AsignaturasPrerequisitosPageRoutingModule } from './asignaturas-prerequisitos-routing.module';
import { AsignaturasPrerequisitosPage } from './asignaturas-prerequisitos.page';
import { ComponentsModule } from 'src/app/core/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignaturasPrerequisitosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AsignaturasPrerequisitosPage]
})
export class AsignaturasPrerequisitosPageModule { }
