import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetalleCarreraPage } from './detalle-carrera.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleCarreraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleCarreraPageRoutingModule { }
