import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnviarCorreoPage } from './enviar-correo.page';

const routes: Routes = [
  {
    path: '',
    component: EnviarCorreoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnviarCorreoPageRoutingModule { }
