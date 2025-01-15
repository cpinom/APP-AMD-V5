import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExcepcionPage } from './excepcion.page';

const routes: Routes = [
  {
    path: '',
    component: ExcepcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExcepcionPageRoutingModule { }
