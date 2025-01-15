import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthPage } from './auth.page';
import { CodeInputModule } from 'angular-code-input';
import { AppMaterialModule } from 'src/app/app-material.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CodeInputModule,
    AppMaterialModule
  ],
  declarations: [AuthPage]
})
export class AuthPageModule { }
