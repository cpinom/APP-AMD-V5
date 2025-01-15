import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OportunidadesAlumnosPage } from './oportunidades-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: OportunidadesAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OportunidadesAlumnosPageRoutingModule {}
