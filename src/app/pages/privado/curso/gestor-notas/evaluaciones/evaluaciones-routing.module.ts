import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EvaluacionesPage } from './evaluaciones.page';

const routes: Routes = [
  {
    path: '',
    component: EvaluacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluacionesPageRoutingModule { }
