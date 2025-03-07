import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApuntesClasesPageRoutingModule } from './apuntes-clases-routing.module';
import { ApuntesClasesPage } from './apuntes-clases.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ApuntesClasesPageRoutingModule
  ],
  declarations: [ApuntesClasesPage]
})
export class ApuntesClasesPageModule { }
