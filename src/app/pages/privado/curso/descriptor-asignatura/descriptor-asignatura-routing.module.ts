import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DescriptorAsignaturaPage } from './descriptor-asignatura.page';

const routes: Routes = [
  {
    path: '',
    component: DescriptorAsignaturaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DescriptorAsignaturaPageRoutingModule {}
