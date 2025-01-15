import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComunicacionesPage } from './comunicaciones.page';

const routes: Routes = [
  {
    path: '',
    component: ComunicacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunicacionesPageRoutingModule { }
