import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalificacionesPage } from './calificaciones.page';

const routes: Routes = [
  {
    path: '',
    component: CalificacionesPage
  },
  // {
  //   path: 'autenticacion',
  //   loadChildren: () => import('./autenticacion/autenticacion.module').then( m => m.AutenticacionPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalificacionesPageRoutingModule {}
