import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoporteTecnicoPage } from './soporte-tecnico.page';

const routes: Routes = [
  {
    path: '',
    component: SoporteTecnicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SoporteTecnicoPageRoutingModule { }
