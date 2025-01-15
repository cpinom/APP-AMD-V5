import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetalleOpinionPage } from './detalle-opinion.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleOpinionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleOpinionPageRoutingModule {}
