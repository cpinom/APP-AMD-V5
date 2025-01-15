import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RiesgosAlumnosPage } from './riesgos-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: RiesgosAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RiesgosAlumnosPageRoutingModule {}
