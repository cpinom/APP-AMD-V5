import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AprendizajesEsperadosPage } from './aprendizajes-esperados.page';

const routes: Routes = [
  {
    path: '',
    component: AprendizajesEsperadosPage
  },
  // {
  //   path: 'filtros',
  //   loadChildren: () => import('./filtros/filtros.module').then(m => m.FiltrosPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprendizajesEsperadosPageRoutingModule { }
