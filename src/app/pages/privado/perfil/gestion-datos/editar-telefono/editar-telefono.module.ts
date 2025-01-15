import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditarTelefonoPage } from './editar-telefono.page';
import { CodeInputModule } from 'angular-code-input';
// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    // NgxIntlTelInputModule,
    CodeInputModule
  ],
  declarations: [EditarTelefonoPage]
})
export class EditarTelefonoPageModule {}
