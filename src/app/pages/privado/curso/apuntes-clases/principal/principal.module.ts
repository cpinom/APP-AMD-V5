import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PrincipalPageRoutingModule } from './principal-routing.module';
import { PrincipalPage } from './principal.page';
import { PipesModule } from 'src/app/core/pipes/pipes.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // PrincipalPageRoutingModule,
    PipesModule
  ],
  declarations: [PrincipalPage]
})
export class PrincipalPageModule { }
