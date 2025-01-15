import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestorNotasPage } from './gestor-notas.page';

const routes: Routes = [
  {
    path: '',
    component: GestorNotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestorNotasPageRoutingModule { }
