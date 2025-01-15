import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DistribucionNotasPage } from './distribucion-notas.page';

const routes: Routes = [
  {
    path: '',
    component: DistribucionNotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DistribucionNotasPageRoutingModule {}
