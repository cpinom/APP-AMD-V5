import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApuntesClasesPageRoutingModule } from './apuntes-clases-routing.module';
import { ApuntesClasesPage } from './apuntes-clases.page';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { PrincipalPageModule } from './principal/principal.module';
import { EditarApuntePageModule } from './editar-apunte/editar-apunte.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApuntesClasesPageRoutingModule,
    PipesModule,
    PrincipalPageModule,
    EditarApuntePageModule
  ],
  declarations: [ApuntesClasesPage]
})
export class ApuntesClasesPageModule { }
