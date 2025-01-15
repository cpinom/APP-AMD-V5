import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AsistenciaClasesPage } from './asistencia-clases.page';

const routes: Routes = [
  {
    path: '',
    component: AsistenciaClasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsistenciaClasesPageRoutingModule { }
