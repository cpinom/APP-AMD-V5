import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarrerasPage } from './carreras.page';

const routes: Routes = [
  {
    path: '',
    component: CarrerasPage
  },
  {
    path: 'detalle-carrera/:areaCcod/:espeCcod',
    loadChildren: () => import('./detalle-carrera/detalle-carrera.module').then(m => m.DetalleCarreraPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarrerasPageRoutingModule { }
