import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SedesPageRoutingModule } from './sedes-routing.module';
import { SedesPage } from './sedes.page';
import { DirectivesModule } from 'src/app/core/directives/directives.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SedesPageRoutingModule,
    DirectivesModule
  ],
  declarations: [SedesPage]
})
export class SedesPageModule { }
